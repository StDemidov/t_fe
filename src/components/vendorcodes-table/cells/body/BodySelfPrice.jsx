import { useEffect, useRef, useState } from 'react';
import { MdCurrencyRuble } from 'react-icons/md';
import styles from './style.module.css';

const BodySelfPrice = ({ vc }) => {
  const selfpriceWNdsAVG = vc.selfPrice;
  const selfpriceWoNdsAVG = vc.selfPriceWONds;
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
      className={`${styles.cell} ${styles.cellSelfPrice}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className={styles.ndsValue}>
        {Number(displayValue).toFixed(0)}
        <MdCurrencyRuble className={styles.ruble} />
      </span>
      <div className={styles.ndsLabel}>
        <span className={styles.ndsLabelWrapper}>
          <span
            className={`${styles.woNdsLabel} ${
              hovered ? styles.hidden : styles.visible
            }`}
          >
            без НДС
          </span>
          <span
            className={`${styles.ndsLabel} ${
              hovered ? styles.visible : styles.hidden
            }`}
          >
            с НДС
          </span>
        </span>
      </div>
    </div>
  );
};

export default BodySelfPrice;
