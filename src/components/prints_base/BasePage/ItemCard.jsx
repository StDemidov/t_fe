import { useMemo } from 'react';
import styles from './style.module.css';

const ItemCard = ({
  item,
  draftStorage,
  setDraftStorage,
  sizesStorage,
  setSizesStorage,
}) => {
  const { image, vendorcode, created_at, pattern_data, barcodes_data } = item;

  const defaultCounts = pattern_data?.default_sizes_counts || {};
  const isSelected = !!sizesStorage[vendorcode];

  // порядок сортировки размеров
  const sizeOrder = [
    'XXS-XS',
    'S-M',
    'L-XL',
    'XS',
    'S',
    'M',
    'L',
    'XL',
    'XXL',
    '4XL',
    'XS/155',
    'S/155',
    'M/155',
    'L/155',
    'XL/155',
    'XXL/155',
    'XS/175',
    'S/175',
    'M/175',
    'L/175',
    'XL/175',
    'XXL/175',
    'XS РОСТ 1',
    'S РОСТ 1',
    'M РОСТ 1',
    'L РОСТ 1',
    'XL РОСТ 1',
    'XXL РОСТ 1',
    'XS РОСТ 2',
    'S РОСТ 2',
    'M РОСТ 2',
    'L РОСТ 2',
    'XL РОСТ 2',
    'XXL РОСТ 2',
  ];

  // мемоизированная сортировка размеров
  const sortedSizes = useMemo(() => {
    if (!barcodes_data) return [];

    return Object.entries(barcodes_data)
      .map(([size, barcode]) => ({ size, barcode }))
      .sort((a, b) => {
        const indexA = sizeOrder.indexOf(a.size);
        const indexB = sizeOrder.indexOf(b.size);

        if (indexA === -1 && indexB === -1) {
          return a.size.localeCompare(b.size);
        }
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;

        return indexA - indexB;
      });
  }, [barcodes_data]);

  // получить текущее значение (черновик)
  const getValue = (size, barcode) => {
    if (draftStorage[vendorcode]?.[barcode] !== undefined) {
      return draftStorage[vendorcode][barcode];
    }
    return defaultCounts[size] ?? 0;
  };

  // изменение значения → только draftStorage
  const handleChange = (barcode, val) => {
    const num = Math.max(0, parseInt(val.replace(/\D/g, '') || '0', 10));

    setDraftStorage((prev) => ({
      ...prev,
      [vendorcode]: {
        ...prev[vendorcode],
        [barcode]: num,
      },
    }));
  };

  // фиксация в заказ
  const handleSelect = () => {
    if (isSelected) {
      // снять с заказа
      setSizesStorage((prev) => {
        const copy = { ...prev };
        delete copy[vendorcode];
        return copy;
      });
    } else {
      // собрать ВСЕ текущие значения (и дефолтные тоже)
      const fullValues = {};

      sortedSizes.forEach(({ size, barcode }) => {
        fullValues[barcode] = getValue(size, barcode);
      });

      setSizesStorage((prev) => ({
        ...prev,
        [vendorcode]: fullValues,
      }));
    }
  };

  return (
    <div
      className={`${styles.orderCard} ${isSelected ? styles.selectedCard : ''}`}
    >
      {/* HEADER */}
      <div className={styles.topSide}>
        <div className={styles.meta}>
          <div className={styles.vendor}>{vendorcode}</div>
          <div className={styles.date}>{created_at}</div>
        </div>
      </div>

      {/* BODY */}
      <div className={styles.bottomSide}>
        <div className={styles.left}>
          <img src={image} alt={vendorcode} className={styles.photo} />
        </div>

        <div className={styles.right}>
          <div className={styles.sizes}>
            {sortedSizes.map(({ size, barcode }) => (
              <div key={barcode} className={styles.sizeRow}>
                <label>{size}</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={getValue(size, barcode)}
                  onChange={(e) => handleChange(barcode, e.target.value)}
                  onFocus={(e) => e.target.select()}
                  disabled={isSelected}
                />
              </div>
            ))}
          </div>

          <label className={styles.radio}>
            <input
              type="checkbox"
              checked={isSelected}
              onChange={handleSelect}
            />
            В заказ
          </label>
        </div>
      </div>
    </div>
  );
};

export default ItemCard;
