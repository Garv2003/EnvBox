import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { logger } from 'hono/logger'
import { secureHeaders } from 'hono/secure-headers'

import { redis } from './db'

import { generateId } from "./utils";

const app = new Hono()

app.use(secureHeaders())
app.use(cors({
    origin: Bun.env.CLIENT_URL as string,
    allowMethods: ['GET', 'POST'],
}))
app.use(logger())

app.get('/api/v1/health', (c) => {
    return c.json({
        message: 'Server is healthy',
        status: 'ok',
    })
})

app.get('/api/v1/stats', async (c) => {
    try {
        const [reads, writes] = await redis
            .pipeline()
            .get("envshare:metrics:reads")
            .get("envshare:metrics:writes")
            .exec<[number, number]>();

        const stars = await fetch("https://api.github.com/repos/garv2003/envbox")
            .then((res) => res.json())
            .then((json) => json.stargazers_count as number);

        return c.json({
            documentsEncrypted: writes,
            documentsDecrypted: reads,
            githubStars: stars,
        })
    } catch (e) {
        console.error(e);
        return c.json({
            documentsEncrypted: 0,
            documentsDecrypted: 0,
            githubStars: 0,
        })
    }
})

app.post('/api/v1/share', async (c) => {
    try {
        const { encrypted, ttl, reads, iv } = await c.req.json()

        const id = generateId();
        const key = ["envshare", id].join(":");

        const tx = redis.multi();

        tx.hset(key, {
            remainingReads: reads > 0 ? reads : null,
            encrypted,
            iv,
        });
        if (ttl) {
            tx.expire(key, ttl);
        }
        tx.incr("envshare:metrics:writes");

        await tx.exec();

        return c.json({
            message: 'Successfully shared',
            status: 'success',
            id,
        })
    }
    catch (e) {
        return c.json({
            message: 'Something went wrong',
            status: 'error',
        })
    }
})

app.post('/api/v1/unseal', async (c) => {
    try {
        const { id } = await c.req.json()

        if (!id) {
            return c.json({
                message: 'No id provided',
                status: 'error',
            })
        }

        const key = ["envshare", id].join(":");

        const [data, _] = await Promise.all([
            await redis.hgetall<{ encrypted: string; remainingReads: number | null; iv: string }>(key),
            await redis.incr("envshare:metrics:reads"),
        ]);

        if (!data) {
            return c.json({
                message: 'Not found',
                status: 'error',
            })
        }

        if (data.remainingReads !== null && data.remainingReads < 1) {
            await redis.del(key);
            return c.json({
                message: 'Not found',
                status: 'error',
            })
        }

        let remainingReads: number | null = null;
        if (data.remainingReads !== null) {
            remainingReads = await redis.hincrby(key, "remainingReads", -1);
        }

        return c.json({ iv: data.iv, encrypted: data.encrypted, remainingReads, message: 'Successfully unsealed', status: 'success' });
    }
    catch (e) {
        return c.json({
            message: 'Something went wrong',
            status: 'error',
        })
    }

})

app.get('*', (c) => {
    return c.json({
        message: 'Nothing to see here',
        status: 'ok',
    })
})

export { app }