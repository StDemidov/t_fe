import { useEffect, useRef, useState } from 'react';
import styles from '../../style.module.css';

const BodyAVGSelfprice = ({ selfpriceWNdsAVG, selfpriceWoNdsAVG }) => {
  const [hovered, setHovered] = useState(false);
  const [displayValue, setDisplayValue] = useState(selfpriceWoNdsAVG);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (hovered) {
      const start = Number(selfpriceWoNdsAVG);
      const end = Number(selfpriceWNdsAVG);
      const duration = 500;
      const steps = 30;
      const stepTime = duration / steps;
      let currentStep = 0;

      intervalRef.current = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const currentValue = start + (end - start) * progress;
        setDisplayValue(currentValue.toFixed(2));
        if (currentStep >= steps) {
          clearInterval(intervalRef.current);
        }
      }, stepTime);
    } else {
      clearInterval(intervalRef.current);
      setDisplayValue(selfpriceWoNdsAVG);
    }

    return () => clearInterval(intervalRef.current);
  }, [hovered, selfpriceWNdsAVG, selfpriceWoNdsAVG]);

  return (
    <div
      className={styles.bodyCell}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span>{Number(displayValue).toFixed(0)}</span>
      <span className={styles.ndsLabelWrapper}>
        <span className={`${styles.ndsLabel} ${hovered ? styles.visible : ''}`}>
          с НДС
        </span>
      </span>
    </div>
  );
};

export default BodyAVGSelfprice;
