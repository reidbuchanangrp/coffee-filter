// hooks/useShops.ts
import { useEffect, useState, useCallback } from 'react';
import { getCoffeeShops } from '../src/lib/api';
import type { CoffeeShop } from '../src/lib/types';

export function useShops() {
  const [shops, setShops] = useState<CoffeeShop[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setLoading(true);
      const data = await getCoffeeShops();
      setShops(data);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load shops');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  return { shops, loading, error, refetch: load };
}
