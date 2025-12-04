import Redis from "ioredis";

export const redisClient = new Redis({
  port: 6379,
  host: "127.0.0.1",
});
