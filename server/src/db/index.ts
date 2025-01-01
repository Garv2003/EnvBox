import { Redis } from '@upstash/redis'

const redis = new Redis({
    url: Bun.env.UPSTASH_REDIS_REST_URL as string,
    token: Bun.env.UPSTASH_REDIS_REST_TOKEN as string,
})

export { redis }