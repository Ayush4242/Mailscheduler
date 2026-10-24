import { Redis } from 'ioredis';
import { getRedisClient } from '../../config/redis.js';
import { config } from '../../config/index.js';

export interface RateLimitCheckResult {
  allowed: boolean;
  currentCount: number;
  maxLimit: number;
  resetTimeMs: number;
  delayMsUntilNextWindow: number;
}

export class DistributedRateLimiter {
  private redis: Redis;

  constructor() {
    this.redis = getRedisClient();
  }

  /**
   * Generates a predictable hourly window timestamp key (e.g., 2026-10-24T19:00:00.000Z)
   */
  private getHourWindowKey(senderKey: string, now: Date = new Date()): { key: string; windowEndMs: number } {
    const startOfHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0, 0);
    const endOfHour = new Date(startOfHour.getTime() + 60 * 60 * 1000);
    const hourIdentifier = startOfHour.toISOString().slice(0, 13); // "2026-10-24T19"
    const key = `ratelimit:hourly:${senderKey}:${hourIdentifier}`;
    return { key, windowEndMs: endOfHour.getTime() };
  }

  /**
   * Atomically increments and checks the hourly limit using an atomic Redis Lua script.
   * If allowed, returns allowed=true.
   * If exceeded, does NOT over-consume and returns allowed=false with the exact delay until the next window.
   */
  async checkAndConsumeHourlyLimit(senderKey: string, customLimit?: number): Promise<RateLimitCheckResult> {
    const limit = customLimit || config.worker.maxEmailsPerHourPerSender;
    const now = new Date();
    const { key, windowEndMs } = this.getHourWindowKey(senderKey, now);
    const delayMsUntilNextWindow = Math.max(1000, windowEndMs - now.getTime());

    // Lua script: checks count against limit, increments only if within limit
    const luaScript = `
      local key = KEYS[1]
      local limit = tonumber(ARGV[1])
      local current = tonumber(redis.call('get', key) or '0')

      if current >= limit then
        return { 0, current }
      else
        local count = redis.call('incr', key)
        if count == 1 then
          redis.call('expire', key, 7200) -- expire in 2 hours
        end
        return { 1, count }
      end
    `;

    try {
      const res = (await this.redis.eval(luaScript, 1, key, limit)) as [number, number];
      const allowed = res[0] === 1;
      const currentCount = res[1];

      return {
        allowed,
        currentCount,
        maxLimit: limit,
        resetTimeMs: windowEndMs,
        delayMsUntilNextWindow,
      };
    } catch (err: any) {
      console.warn(`[RateLimiter Warning] Redis check failed (${err.message}). Defaulting to allowed for continuity.`);
      return {
        allowed: true,
        currentCount: 1,
        maxLimit: limit,
        resetTimeMs: windowEndMs,
        delayMsUntilNextWindow: 0,
      };
    }
  }

  /**
   * Enforces minimum inter-send delay per sender to prevent spamming SMTP connections
   */
  async enforceMinDelay(senderKey: string): Promise<void> {
    const minDelay = config.worker.minDelayBetweenEmailsMs;
    if (minDelay <= 0) return;

    const delayKey = `ratelimit:delay:${senderKey}`;
    try {
      const now = Date.now();
      const lastSentStr = await this.redis.get(delayKey);
      if (lastSentStr) {
        const lastSent = parseInt(lastSentStr, 10);
        const elapsed = now - lastSent;
        if (elapsed < minDelay) {
          const waitMs = minDelay - elapsed;
          await new Promise((resolve) => setTimeout(resolve, waitMs));
        }
      }
      // Record latest send time and set TTL
      await this.redis.set(delayKey, Date.now().toString(), 'PX', minDelay * 2);
    } catch (err: any) {
      // If Redis has transient error, do local safety sleep
      await new Promise((resolve) => setTimeout(resolve, minDelay));
    }
  }
}

export const rateLimiter = new DistributedRateLimiter();
