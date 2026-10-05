import { useEffect, useState } from 'react';

/** Two columns from 900 px width, one column with tabs below. */
const query = '(min-width: 900px)';

export function useWide() {
  const [wide, setWide] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const mq = matchMedia(query);
    const on = () => setWide(mq.matches);
    mq.addEventListener('change', on);
    return () => mq.removeEventListener('change', on);
  }, []);
  return wide;
}
