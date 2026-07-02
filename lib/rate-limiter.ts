const store = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(
  key: string,
  maxAttempts: number = 5,
  windowMs: number = 60_000
): { allowed: boolean; remaining: number; resetIn: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || now > entry.resetAt) {
    store.set(key, { count: 1, resetAt: now + windowMs });
    return { allowed: true, remaining: maxAttempts - 1, resetIn: windowMs };
  }

  entry.count++;
  const remaining = Math.max(0, maxAttempts - entry.count);
  const resetIn = entry.resetAt - now;

  if (entry.count > maxAttempts) {
    return { allowed: false, remaining: 0, resetIn };
  }

  return { allowed: true, remaining, resetIn };
}

export function getRateLimitHeaders(
  key: string,
  maxAttempts: number,
  windowMs: number
): Record<string, string> {
  const { remaining, resetIn } = rateLimit(key, maxAttempts, windowMs);
  return {
    "X-RateLimit-Limit": String(maxAttempts),
    "X-RateLimit-Remaining": String(remaining),
    "X-RateLimit-Reset": String(Math.ceil(resetIn / 1000)),
  };
}
