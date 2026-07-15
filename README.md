# EnvBox

EnvBox is a small full-stack web app for sharing environment variables (or any short secret text) through one-time, expiring links. Secrets are encrypted **in the browser** with the Web Crypto API before anything is sent to the server; the server only ever stores ciphertext and never sees the encryption key. The decryption key travels inside the URL fragment (`#...`), which browsers never transmit to the server, so the backend has zero knowledge of the plaintext. Each share can be capped by a number of reads and/or a time-to-live, after which it self-destructs from storage.

The project is a two-part monorepo: a Hono API running on Bun with Upstash Redis for storage, and a React Router v7 single-page/SSR client. It is a complete, working implementation (conceptually similar to Upstash's EnvShare).

## Features

- **Client-side encryption (zero-knowledge server).** Plaintext is encrypted in the browser with AES-GCM (128-bit) via `crypto.subtle`. Only the ciphertext and IV are POSTed to the server.
- **Key-in-fragment sharing.** After encryption the client packs a version byte, the storage id, and the raw key into a single base58 "composite key" and places it in the URL hash (`/unseal#<compositeKey>`). Because the fragment is never sent in HTTP requests, the server cannot reconstruct the key.
- **Expiring shares (TTL).** A share can be given a time-to-live in minutes, hours, or days; the server sets a Redis `EXPIRE` so the entry auto-deletes.
- **Read limits / burn-after-reads.** A share can be limited to N reads. The server decrements a `remainingReads` counter on each unseal and deletes the entry once it is exhausted. A value of `0` means unlimited.
- **File upload.** The share form accepts a text file (up to 16 KB) and loads its contents into the editor.
- **Usage stats.** The home page shows total documents encrypted, documents decrypted (read from Redis metric counters), and the project's GitHub star count.
- **Legacy key-version support.** Decryption chooses AES-CBC for composite-key version 1 and AES-GCM for version 2 (the current default), so older links remain decryptable.

## How it works / Architecture

Three services, wired together in `docker-compose.yml`: `client`, `server`, and a `redis` container (the server code itself targets Upstash Redis over its REST client).

**Share flow (`client/app/routes/share.tsx`):**
1. `encrypt()` (`client/app/utils/encryption.ts`) generates a fresh AES-GCM key, a random 16-byte IV, and encrypts the text. It returns the raw exported key, the ciphertext, and the IV as byte arrays.
2. The client base58-encodes the ciphertext and IV and POSTs them to `POST /api/v1/share` along with `ttl` and `reads`. The key is **not** included.
3. The server (`server/src/app.ts`) generates a random 16-byte id (`generateId`), stores a Redis hash `envshare:<id>` with `{ encrypted, iv, remainingReads }`, optionally sets a TTL, increments the `writes` metric, and returns the id.
4. The client builds the composite key with `encodeCompositeKey(LATEST_KEY_VERSION, id, key)` (`client/app/utils/encoding.ts`) and produces a link of the form `/unseal#<compositeKey>`.

**Unseal flow (`client/app/routes/unseal.tsx`):**
1. The client reads the composite key from `location.hash` and calls `decodeCompositeKey()` to recover `{ id, encryptionKey, version }`.
2. It POSTs only the `id` to `POST /api/v1/unseal`.
3. The server loads `envshare:<id>`, increments the `reads` metric, enforces/decrements `remainingReads` (deleting the key when exhausted), and returns `{ encrypted, iv, remainingReads }`.
4. `decrypt()` imports the key from the fragment and decrypts locally, so plaintext is reconstructed only in the browser.

**Key modules**
- `server/src/app.ts` — Hono app and all routes (`/health`, `/stats`, `/share`, `/unseal`).
- `server/src/db/index.ts` — Upstash Redis client (`UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`).
- `server/src/utils/index.ts` — random id generation; `server/src/utils/base58.ts` — base58 codec (`base-x`).
- `client/app/utils/encryption.ts` — Web Crypto encrypt/decrypt/keygen.
- `client/app/utils/encoding.ts` — composite-key pack/unpack (version + id + key).
- `client/app/routes.ts` — route table (home, `/share`, `/unseal`, 404) under a shared layout.
- `client/app/api/index.ts` — Axios instance pointed at `VITE_API_URL`.

Relevant constants: id length 16 bytes, encryption-key length 128, latest composite-key version 2 (`client/app/constants/index.ts`).

## Tech stack

**Server (`server/`)**
- Runtime: Bun (`Bun.serve`-style default export on port `7896`)
- Framework: Hono 4 (`hono/cors`, `hono/logger`, `hono/secure-headers`)
- Storage: Upstash Redis (`@upstash/redis`) — pipelines, transactions, hashes, TTL, counters
- `base-x` for base58 encoding

**Client (`client/`)**
- React 19 + React Router 7 (SSR/`react-router-serve`), Vite 5
- Tailwind CSS 3 with `tailwindcss-animate`, `class-variance-authority`, `tailwind-merge`, `clsx`
- Radix UI primitives (dialog, dropdown, label, select, slot, toast) — shadcn-style components in `client/app/components/ui`
- `framer-motion`, `lucide-react`, `@tabler/icons-react`, `next-themes`
- `axios` (HTTP), `zod` + `react-hook-form` + `@hookform/resolvers` (present in deps), `react-hot-toast` / `sonner` (toasts), `base-x`, `uuid`

**Infra**: Docker (`oven/bun` base images), `docker-compose` (client, server, redis).

## Getting started

Prerequisites: [Bun](https://bun.sh) and an Upstash Redis database (or a local Redis, adjusting the client config).

**Server**
```bash
cd server
bun install
# provide the following env vars (e.g. in the shell or an env file):
#   UPSTASH_REDIS_REST_URL, UPSTASH_REDIS_REST_TOKEN, CLIENT_URL
bun run dev        # hot-reloads src/index.ts, serves on port 7896
```

**Client**
```bash
cd client
bun install
# set VITE_API_URL to the server's base URL (e.g. http://localhost:7896)
bun run dev        # React Router dev server
bun run build      # production build
bun run start      # serve the production build
```

**Docker Compose (all services)**
```bash
docker compose up --build
```
This starts `client`, `server`, and a `redis` container. Note: the compose file maps host ports `3000` (client) and `4000` (server); the server source listens on `7896`, so align the port/env values for your setup.

## Usage

1. Open the app and go to **Share**.
2. Paste your `.env` contents (or upload a text file up to 16 KB).
3. Set **READS** (how many times it can be opened; `0` = unlimited) and **TTL** (lifetime in minutes/hours/days; `0` = no expiry).
4. Click **Share**. The app encrypts locally and returns a link like `https://…/unseal#<compositeKey>`.
5. Send that link to the recipient. Opening it (or clicking **Unseal**) fetches the ciphertext, decrypts it in-browser using the key from the URL fragment, and shows the remaining reads. Once reads or TTL are exhausted, the entry is deleted server-side.

## Project structure

```
EnvBox/
├── docker-compose.yml          # client + server + redis services
├── server/                     # Hono API on Bun
│   ├── Dockerfile              # oven/bun image
│   ├── package.json            # hono, @upstash/redis, base-x
│   └── src/
│       ├── index.ts            # Bun entrypoint (port 7896)
│       ├── app.ts              # Hono app: /health, /stats, /share, /unseal
│       ├── db/index.ts         # Upstash Redis client
│       ├── constants/index.ts  # ID_LENGTH
│       └── utils/              # generateId + base58 codec
└── client/                     # React Router 7 app
    ├── Dockerfile              # multi-stage bun build
    ├── react-router.config.ts  # React Router config
    ├── vite.config.ts          # Vite + tsconfig paths
    ├── tailwind.config.ts      # Tailwind setup
    ├── package.json            # React 19, react-router, radix, tailwind
    └── app/
        ├── routes.ts           # route table (home, share, unseal, 404)
        ├── root.tsx            # app root
        ├── api/index.ts        # axios instance (VITE_API_URL)
        ├── constants/index.ts  # ID_LENGTH, ENCRYPTION_KEY_LENGTH, LATEST_KEY_VERSION
        ├── utils/
        │   ├── encryption.ts   # AES-GCM encrypt/decrypt via Web Crypto
        │   ├── encoding.ts     # composite-key pack/unpack
        │   └── base58.ts       # base58 codec
        ├── layouts/CommonLayout.tsx   # header + outlet + footer
        ├── routes/             # home.tsx, share.tsx, unseal.tsx, 404.tsx
        └── components/         # ui/ (radix-based) + custom/ (Header, Footer, Stats)
```
