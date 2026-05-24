import Redis from "ioredis";

export const redis = new Redis({
    host:"worksphere-redis",
    port: 6379
})