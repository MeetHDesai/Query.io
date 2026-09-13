/**
 * In-memory per-user rate limiter using a fixed-window counter.
 *
 * Limitation: state is held in process memory, so limits reset on server
 * restart and are NOT shared across multiple server instances (e.g. serverless
 * functions or a horizontally scaled deployment). Fine for controlling cost
 * on a single-instance deployment; a distributed store (e.g. Redis) would be
 * needed to enforce a global limit across instances.
 */

interface WindowState {
  count: number;
  windowStart: number;
}

const buckets = new Map<string, WindowState>();

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  /** Milliseconds until the current window resets. */
  retryAfterMs: number;
}

/**
 * Checks and records a request for the given key against a fixed-window limit.
 *
 * @param key - Unique identifier for the caller (e.g. user ID), optionally
 *   namespaced by the caller (e.g. `` `${userId}:query` ``) to give distinct
 *   endpoints independent limits.
 * @param limit - Maximum number of requests allowed per window.
 * @param windowMs - Window length in milliseconds.
 */
export function checkRateLimit(key: string, limit: number, windowMs: number): RateLimitResult {
  const now = Date.now();
  const existing = buckets.get(key);

  if (!existing || now - existing.windowStart >= windowMs) {
    buckets.set(key, { count: 1, windowStart: now });
    return { allowed: true, limit, remaining: limit - 1, retryAfterMs: windowMs };
  }

  const retryAfterMs = windowMs - (now - existing.windowStart);

  if (existing.count >= limit) {
    return { allowed: false, limit, remaining: 0, retryAfterMs };
  }

  existing.count += 1;
  return { allowed: true, limit, remaining: limit - existing.count, retryAfterMs };
}

/** Clears all rate limit state. Intended for use in tests only. */
export function _resetRateLimitState(): void {
  buckets.clear();
}
