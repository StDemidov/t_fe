import React from 'react';
import styles from './OrdersToProcessorsSkeleton.module.css';

const ROWS = 8;
const FILTERS = 6;
const WEEK_CELLS = 12;

/**
 * Скелетон страницы «Заказы переработчикам» — повторяет структуру реального
 * макета (тулбар, шапка ганта, строки с карточкой и гант-областью), пока
 * идёт загрузка прогнозов.
 */
const OrdersToProcessorsSkeleton = () => (
  <div className={styles.root}>
    {/* Тулбар */}
    <div className={styles.toolbar}>
      <div className={styles.paginationRow}>
        <div className={`${styles.block} ${styles.pgSmall}`} />
        <div className={`${styles.block} ${styles.pgWide}`} />
        <div className={`${styles.block} ${styles.pgSmall}`} />
        <div className={`${styles.block} ${styles.pgSmall}`} />
        <div className={`${styles.block} ${styles.pgSmall}`} />
      </div>
      <div className={styles.filtersRow}>
        {Array.from({ length: FILTERS }).map((_, i) => (
          <div key={i} className={`${styles.block} ${styles.filter}`} />
        ))}
        <div className={`${styles.block} ${styles.filterWide}`} />
      </div>
    </div>

    {/* Гант */}
    <div className={styles.scope}>
      <div className={styles.header}>
        {Array.from({ length: WEEK_CELLS }).map((_, i) => (
          <div key={i} className={`${styles.block} ${styles.weekCell}`} />
        ))}
      </div>

      <div className={styles.rows}>
        {Array.from({ length: ROWS }).map((_, r) => (
          <div key={r} className={styles.row}>
            <div className={styles.card}>
              <div className={styles.cardTop}>
                <div>
                  <div className={`${styles.block} ${styles.vc}`} />
                  <div className={`${styles.block} ${styles.dateLine}`} />
                </div>
                <div className={`${styles.block} ${styles.icon}`} />
              </div>
              <div className={styles.chipRow}>
                <div className={`${styles.block} ${styles.chip}`} />
                <div className={`${styles.block} ${styles.chip}`} />
                <div className={`${styles.block} ${styles.chip}`} />
              </div>
              <div className={styles.metrics}>
                {[0, 1, 2, 3].map((m) => (
                  <div key={m} className={`${styles.block} ${styles.metric}`} />
                ))}
              </div>
            </div>

            <div className={styles.ganttRow}>
              {Array.from({ length: WEEK_CELLS }).map((_, i) => (
                <div key={i} className={`${styles.block} ${styles.weekCell}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

export default OrdersToProcessorsSkeleton;