interface LowStockCache {
  data: any[] | null;
  cachedAt: number;
}

const lowStockCache: LowStockCache = {
  data: null,
  cachedAt: 0,
};

export function getCachedLowStock() {
  const now = Date.now();
  if (lowStockCache.data && now - lowStockCache.cachedAt < 60000) {
    return lowStockCache.data;
  }
  return null;
}

export function setCachedLowStock(data: any[]) {
  lowStockCache.data = data;
  lowStockCache.cachedAt = Date.now();
}

export function invalidateLowStockCache() {
  lowStockCache.cachedAt = 0;
  lowStockCache.data = null;
}
