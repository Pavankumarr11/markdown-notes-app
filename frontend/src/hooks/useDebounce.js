// src/hooks/useDebounce.js
// PURPOSE: Returns a debounced copy of `value` — used for auto-save.

import { useState, useEffect } from 'react';

export function useDebounce(value, delay = 800) {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const id = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(id);
  }, [value, delay]);

  return debounced;
}
