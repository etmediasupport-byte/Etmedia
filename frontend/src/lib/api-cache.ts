// High-Speed In-Memory Client Cache for Instant (0ms) Page Transitions
// Implements Stale-While-Revalidate pattern so pages render immediately

const clientCache = new Map<string, { data: any; timestamp: number }>();
const DEFAULT_TTL_MS = 90 * 1000; // 90 seconds cache

export async function fetchWithCache<T = any>(
  url: string,
  options?: RequestInit,
  ttlMs: number = DEFAULT_TTL_MS
): Promise<T> {
  const cacheKey = url;
  const entry = clientCache.get(cacheKey);
  const now = Date.now();

  // If cached and fresh, return immediately in 0ms!
  if (entry && now - entry.timestamp < ttlMs) {
    // Background stale-while-revalidate if older than 15s
    if (now - entry.timestamp > 15 * 1000) {
      fetch(url, options)
        .then((res) => res.json())
        .then((fresh) => {
          clientCache.set(cacheKey, { data: fresh, timestamp: Date.now() });
        })
        .catch(() => {});
    }
    return entry.data as T;
  }

  // Not in cache or expired: fetch, cache and return
  const res = await fetch(url, options);
  const data = await res.json();
  clientCache.set(cacheKey, { data, timestamp: Date.now() });
  return data as T;
}

export function invalidateClientCache(pattern?: string): void {
  if (!pattern) {
    clientCache.clear();
    return;
  }
  for (const key of clientCache.keys()) {
    if (key.includes(pattern)) {
      clientCache.delete(key);
    }
  }
}

export function setCachedData(url: string, data: any): void {
  clientCache.set(url, { data, timestamp: Date.now() });
}
