export interface RateLimitEntry {
  count: number;
  resetAt: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterSec: number;
}

export function createRateLimiter(limit: number, windowMs: number) {
  const store = new Map<string, RateLimitEntry>();

  return function check(key: string): RateLimitResult {
    const now = Date.now();
    for (const [k, v] of store) if (now > v.resetAt) store.delete(k);

    const entry = store.get(key);
    if (!entry || now > entry.resetAt) {
      store.set(key, { count: 1, resetAt: now + windowMs });
      return { allowed: true, remaining: limit - 1, retryAfterSec: 0 };
    }
    if (entry.count >= limit) {
      return { allowed: false, remaining: 0, retryAfterSec: Math.ceil((entry.resetAt - now) / 1000) };
    }
    entry.count++;
    return { allowed: true, remaining: limit - entry.count, retryAfterSec: 0 };
  };
}
