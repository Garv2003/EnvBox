FROM oven/bun:1 AS dependencies-env
COPY . /app

FROM dependencies-env AS development-dependencies-env
COPY ./package.json bun.lockb /app/
WORKDIR /app
RUN bun i --frozen-lockfile

FROM dependencies-env AS production-env
COPY ./package.json bun.lockb /app/
WORKDIR /app
RUN bun i --production

EXPOSE 7896

CMD ["bun", "run", "dev"]