// Simple in-memory sliding-window rate limiter.
//
// TODO: Replace with a Redis-backed limiter in multi-instance / serverless
// deployments — in-memory state is per-process and resets on cold start.

interface Bucket {
  timestamps: number[];
}

const buckets = new Map<string, Bucket>();

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  retryAfterMs: number;
}

/**
 * @param key       unique key (e.g. `coupon:<ip>`)
 * @param limit     max requests within the window
 * @param windowMs  window length in milliseconds
 */
export function rateLimit(
  key: string,
  limit: number,
  windowMs: number,
  now: number = Date.now()
): RateLimitResult {
  const cutoff = now - windowMs;
  const bucket = buckets.get(key) ?? { timestamps: [] };
  // Drop timestamps outside the window.
  bucket.timestamps = bucket.timestamps.filter((t) => t > cutoff);

  if (bucket.timestamps.length >= limit) {
    const oldest = bucket.timestamps[0];
    buckets.set(key, bucket);
    return {
      allowed: false,
      remaining: 0,
      retryAfterMs: Math.max(0, oldest + windowMs - now),
    };
  }

  bucket.timestamps.push(now);
  buckets.set(key, bucket);
  return {
    allowed: true,
    remaining: limit - bucket.timestamps.length,
    retryAfterMs: 0,
  };
}
