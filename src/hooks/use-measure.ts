// use-measure.ts
import { useState, useLayoutEffect } from 'react';

export function useMeasure() {
  const [dimensions, setDimensions] = useState({ width: 0, height: 0 });
  const [ref, setRef] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (ref) {
      const measure = () => {
        setDimensions({
          width: ref.offsetWidth,
          height: ref.offsetHeight,
        });
      };
      measure();
      const resizeObserver = new ResizeObserver(measure);
      resizeObserver.observe(ref);
      return () => resizeObserver.disconnect();
    }
  }, [ref]);

  return [setRef, dimensions] as const;
}