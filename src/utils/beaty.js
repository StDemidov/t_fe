import { useEffect, useRef, useState } from 'react';

export const useAnimatedCounter = (value, duration = 600) => {
  console.log(value);
  const safeValue = Number(value) || 0;
  console.log(safeValue);

  const [displayValue, setDisplayValue] = useState(safeValue);

  const startValueRef = useRef(safeValue);
  const startTimeRef = useRef(null);

  useEffect(() => {
    startValueRef.current = displayValue;
    startTimeRef.current = null;

    const animate = (timestamp) => {
      if (startTimeRef.current === null) {
        startTimeRef.current = timestamp;
      }

      const progress = Math.min(
        (timestamp - startTimeRef.current) / duration,
        1
      );

      const current =
        startValueRef.current + (safeValue - startValueRef.current) * progress;

      setDisplayValue(Math.round(current));

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);

    return () => cancelAnimationFrame(animate);
  }, [safeValue, duration]);

  return displayValue;
};
