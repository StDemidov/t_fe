import { useEffect, useRef, useState } from 'react';

const AnimatedNumber = ({ value, duration = 300 }) => {
  const [displayValue, setDisplayValue] = useState(value);
  const prevValueRef = useRef(value);
  value = value ? value : 1000;

  useEffect(() => {
    let start = prevValueRef.current;
    let end = value;
    let startTime;

    const step = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const current = Math.floor(start + (end - start) * progress);
      setDisplayValue(current);

      if (progress < 1) {
        requestAnimationFrame(step);
      }
    };

    requestAnimationFrame(step);
    prevValueRef.current = value;
  }, [value, duration]);

  return <span>{displayValue}</span>;
};

export default AnimatedNumber;
