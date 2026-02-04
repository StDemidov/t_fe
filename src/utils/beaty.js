import { useEffect, useRef, useState } from 'react';

export const useAnimatedCounter = (value, duration = 600) => {
  const safeValue = Number(value) || 0;

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

      // setDisplayValue(Math.round(current));
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

export const formatDate = (date) =>
  date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
  });

export const replaceZeros = (data) => {
  const nonZeroValues = data.filter((value) => value > 0);

  return data.map((value) => (value === 0 ? 0.1 : value));
};

export const getDate = (date, time = false) => {
  if (!time) {
    return date
      .toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour12: false,
      })
      .replace(',', '');
  } else {
    return date
      .toLocaleString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: false,
      })
      .replace(',', '');
  }
};
