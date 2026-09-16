import { useEffect, useRef, useState } from 'react';
import { MdCurrencyRuble } from 'react-icons/md';
import styles from './SkusTable.module.css';

/**
 * Ячейка колонки «Себестоимость».
 *
 * По умолчанию показывает значение без НДС (selfpriceWithoutNds); при наведении
 * плавно пересчитывает число к значению с НДС (selfpriceWithNds), а подпись
 * «без НДС» меняется на «с НДС».
 *
 * @param {object} props
 * @param {object} props.item — товар
 */
const SelfPriceCell = ({ item }) => {
  const withNds = Number(item.selfpriceWithNds) || 0;
  const withoutNds = Number(item.selfpriceWithoutNds) || 0;
  const [hovered, setHovered] = useState(false);
  const [displayValue, setDisplayValue] = useState(withoutNds);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (hovered) {
      const start = withoutNds;
      const end = withNds;
      const duration = 500;
      const steps = 30;
      const stepTime = duration / steps;
      let currentStep = 0;

      intervalRef.current = setInterval(() => {
        currentStep++;
        const progress = currentStep / steps;
        const currentValue = start + (end - start) * progress;
        setDisplayValue(currentValue);
        if (currentStep >= steps) {
          clearInterval(intervalRef.current);
        }
      }, stepTime);
    } else {
      clearInterval(intervalRef.current);
      setDisplayValue(withoutNds);
    }

    return () => clearInterval(intervalRef.current);
  }, [hovered, withNds, withoutNds]);

  return (
    <div
      className={styles.selfPriceCell}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <span className={styles.ndsValue}>
        {Number(displayValue).toFixed(0)}
        <MdCurrencyRuble className={styles.ruble} />
      </span>
      <span className={styles.ndsLabelRow}>
        <span
          className={`${styles.ndsLabel} ${
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
  );
};

export default SelfPriceCell;
