import { useEffect, useState } from "react";

/**
 * Debounce a value - returns the value only after it has been stable
 * for the specified delay. Useful for search inputs to avoid
 * re-rendering on every keystroke.
 */
export function useDebouncedValue<T>(value: T, delay = 250): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = window.setTimeout(() => {
      setDebounced(value);
    }, delay);

    return () => {
      window.clearTimeout(id);
    };
  }, [value, delay]);

  return debounced;
}
