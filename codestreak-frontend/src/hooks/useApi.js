import { useState, useEffect, useCallback } from "react";

/**
 * useApi — generic hook for async API calls.
 *
 * @param {Function} apiFn        — () => Promise<data>
 * @param {*}        initialData  — initial value before first fetch
 * @param {boolean}  immediate    — run on mount? (default true)
 *
 * Returns { data, loading, error, refetch }
 */
export function useApi(apiFn, initialData = null, immediate = true) {
  const [data, setData] = useState(initialData);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await apiFn();
      setData(result);
      return result;
    } catch (err) {
      setError(err?.error || err?.message || "Something went wrong");
      throw err;
    } finally {
      setLoading(false);
    }
  }, [apiFn]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (immediate) run();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return { data, loading, error, refetch: run };
}
