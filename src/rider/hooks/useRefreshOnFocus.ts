import { useEffect, useRef } from 'react';

/**
 * Custom hook that calls a callback function when the page regains focus.
 * Useful for refreshing data after navigation.
 */
export function useRefreshOnFocus(callback: () => void | Promise<void>) {
  const callbackRef = useRef(callback);

  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  useEffect(() => {
    const handleFocus = () => {
      callbackRef.current();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, []);
}

/**
 * Custom hook that refetches data when page regains visibility or when dependencies change.
 */
export function useRefreshableData<T>(
  fetchFn: () => Promise<T>,
  onData: (data: T) => void,
  dependencies: unknown[] = []
) {
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;

    const load = async () => {
      try {
        const data = await fetchFn();
        if (isMountedRef.current) {
          onData(data);
        }
      } catch (error) {
        console.error('Data refresh error:', error);
      }
    };

    load();

    return () => {
      isMountedRef.current = false;
    };
  }, dependencies);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        const load = async () => {
          try {
            const data = await fetchFn();
            if (isMountedRef.current) {
              onData(data);
            }
          } catch (error) {
            console.error('Focus refresh error:', error);
          }
        };
        load();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [fetchFn, onData]);
}
