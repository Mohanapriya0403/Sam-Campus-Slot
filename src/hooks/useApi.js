import { useState, useEffect, useCallback, useRef } from 'react';

/** Runs an async fetcher, tracking loading/error/data state. Re-runs whenever
 * anything in `deps` changes. Pass `null` as the fetcher's return from
 * `enabled` logic (or skip calling this hook) to hold off fetching — e.g.
 * while a required id/department isn't known yet.
 *
 *   const { data: week, loading, error } = useApi(
 *     () => getTimetable(department, year, batch),
 *     [department, year, batch]
 *   );
 */
export function useApi(fetcher, deps = []) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  const run = useCallback(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.resolve(fetcherRef.current())
      .then((result) => {
        if (!cancelled) setData(result);
      })
      .catch((err) => {
        if (!cancelled) setError(err);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, deps); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => run(), [run]);

  return { data, loading, error, refetch: run };
}
