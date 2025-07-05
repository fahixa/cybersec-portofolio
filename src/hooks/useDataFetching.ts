import { useState, useEffect, useCallback, useRef } from 'react';
import { apiCache } from '../lib/apiCache';

interface UseDataFetchingOptions<T> {
  cacheKey?: string;
  cacheTTL?: number;
  enabled?: boolean;
  refetchOnWindowFocus?: boolean;
  staleTime?: number;
}

interface UseDataFetchingResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  isStale: boolean;
}

export function useDataFetching<T>(
  fetchFn: () => Promise<T>,
  dependencies: any[] = [],
  options: UseDataFetchingOptions<T> = {}
): UseDataFetchingResult<T> {
  const {
    cacheKey,
    cacheTTL = 5 * 60 * 1000, // 5 minutes default
    enabled = true,
    refetchOnWindowFocus = false,
    staleTime = 30 * 1000 // 30 seconds
  } = options;

  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetch, setLastFetch] = useState<number>(0);
  
  const abortControllerRef = useRef<AbortController | null>(null);
  const isMountedRef = useRef(true);

  // Check if data is stale
  const isStale = Date.now() - lastFetch > staleTime;

  const fetchData = useCallback(async () => {
    if (!enabled) return;

    // Cancel previous request
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    // Check cache first
    if (cacheKey) {
      const cached = apiCache.get<T>(cacheKey);
      if (cached && !isStale) {
        setData(cached);
        setError(null);
        return;
      }
    }

    setLoading(true);
    setError(null);

    // Create new abort controller
    abortControllerRef.current = new AbortController();

    try {
      const result = await fetchFn();
      
      if (!isMountedRef.current) return;

      setData(result);
      setLastFetch(Date.now());
      
      // Cache the result
      if (cacheKey && result) {
        apiCache.set(cacheKey, result, cacheTTL);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      
      if (err instanceof Error && err.name === 'AbortError') {
        return; // Request was cancelled
      }
      
      const errorMessage = err instanceof Error ? err.message : 'An error occurred';
      setError(errorMessage);
      console.error('Data fetching error:', err);
    } finally {
      if (isMountedRef.current) {
        setLoading(false);
      }
    }
  }, [fetchFn, enabled, cacheKey, cacheTTL, isStale, ...dependencies]);

  // Initial fetch and dependency-based refetch
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Window focus refetch
  useEffect(() => {
    if (!refetchOnWindowFocus) return;

    const handleFocus = () => {
      if (isStale) {
        fetchData();
      }
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [refetchOnWindowFocus, fetchData, isStale]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, []);

  return {
    data,
    loading,
    error,
    refetch: fetchData,
    isStale
  };
}

// Specialized hooks for common data types
export function useProfile(userId?: string) {
  return useDataFetching(
    () => import('../lib/supabase').then(({ DatabaseService }) => 
      DatabaseService.getProfile(userId)
    ),
    [userId],
    {
      cacheKey: `profile:${userId || 'default'}`,
      cacheTTL: 10 * 60 * 1000, // 10 minutes
      refetchOnWindowFocus: true
    }
  );
}

export function useWriteups(options: any = {}) {
  return useDataFetching(
    () => import('../lib/supabase').then(({ DatabaseService }) => 
      DatabaseService.getWriteups(options)
    ),
    [JSON.stringify(options)],
    {
      cacheKey: `writeups:${JSON.stringify(options)}`,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
      enabled: !options.search // Don't cache search results
    }
  );
}

export function useArticles(options: any = {}) {
  return useDataFetching(
    () => import('../lib/supabase').then(({ DatabaseService }) => 
      DatabaseService.getArticles(options)
    ),
    [JSON.stringify(options)],
    {
      cacheKey: `articles:${JSON.stringify(options)}`,
      cacheTTL: 5 * 60 * 1000, // 5 minutes
      enabled: !options.search // Don't cache search results
    }
  );
}