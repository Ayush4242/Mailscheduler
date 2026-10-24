import { Redis } from 'ioredis';
import { config } from './index.js';

let redisInstance: Redis | null = null;

export function getRedisClient(): Redis {
  if (!redisInstance) {
    redisInstance = new Redis({
      host: config.redis.host,
      port: config.redis.port,
      password: config.redis.password,
      maxRetriesPerRequest: null,
      enableReadyCheck: false,
      lazyConnect: true,
      retryStrategy(times) {
        // Exponential backoff up to 2 seconds
        return Math.min(times * 100, 2000);
      },
    });

    redisInstance.on('error', (err) => {
      console.warn(`[Redis Connection Warning]: ${err.message}`);
    });
  }
  return redisInstance;
}
