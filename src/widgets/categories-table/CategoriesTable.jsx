import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import { MdDragIndicator, MdCurrencyRuble } from 'react-icons/md';
import { IoMdCloseCircle } from 'react-icons/io';
import LazyLoad from 'react-lazyload';

import { getVisibleColumns, FIXED_COLUMN_ID, lastDaily, sumDailyMap, divideDailyPercent, percentRatio } from './columns';
import {
  BarChart,
  LineChart,
  SignedLineChart,
  StackedBarChart,
  StepLineChart,
} from '../../shared/ui';
import styles from './CategoriesTable.module.css';

/** Варианты количества строк на странице. */
export const PAGE_SIZE_OPTIONS = [25, 50, 100];

/**
 * Ленивая обёртка графика: строит диаграмму только когда она попадает в зону
 * видимости относительно скролл-контейнера таблицы.
 */
const LazyChart = ({ height, children }) => (
  <LazyLoad
    height={height}
    offset={200}
    once
    scrollContainer="[data-istablescroll]"
    style={{ flex: '1 1 0', width: '100%', minWidth: 0 }}
  >
    {children}
  </LazyLoad>
);

/**
 * Ячейка колонки «Средняя себестоимость»: по умолчанию значение без НДС, при
 * наведении плавно пересчитывается к значению с НДС — как в колонке
 * «Себестоимость» в Товарах.
 */
const CategorySelfPriceCell = ({ item }) => {
  const withNds = Number(item.avgSkuSelfpriceWithNds) || 0;
  const withoutNds = Number(item.avgSkuSelfpriceWithoutNds) || 0;
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
        setDisplayValue(start + (end - start) * progress);
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

/**
 * Подпись колонки в шапке: если текст не помещается, при наведении он едет
 * влево до конца, затем отматывается назад к началу — и так по кругу.
 */
const HeaderLabel = ({ children }) => {
  const wrapRef = useRef(null);
  const textRef = useRef(null);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const check = () => {
      if (textRef.current && wrapRef.current) {
        setOverflows(textRef.current.scrollWidth > wrapRef.current.clientWidth);
      }
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [children]);

  const shift =
    overflows && textRef.current && wrapRef.current
      ? textRef.current.scrollWidth - wrapRef.current.clientWidth
      : 0;
  const dur = Math.max(4, shift / 31.2);

  return (
    <span
      ref={wrapRef}
      className={`${styles.headerLabel} ${overflows ? styles.headerLabelMarquee : ''}`}
    >
      <span
        ref={textRef}
        className={styles.headerLabelText}
        style={overflows ? { '--shift': `${shift}px`, '--dur': `${dur}s` } : undefined}
      >
        {children}
      </span>
    </span>
  );
};

/**
 * Таблица Категорий.
 *
 * Поддерживает перетаскивание колонок за маркер и скрытие колонок крестиком
 * (колонка «Категория» закреплена слева). resetTrigger возвращает порядок и
 * видимость к исходному состоянию.
 */
const CategoriesTable = ({ items = [], resetTrigger = 0 }) => {
  const allColumns = useMemo(() => getVisibleColumns(), []);
  const defaultOrder = useMemo(() => allColumns.map((c) => c.id), [allColumns]);

  const [columnOrder, setColumnOrder] = useState(defaultOrder);
  const [hiddenColumns, setHiddenColumns] = useState(() => new Set());
  const dragColRef = useRef(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  useEffect(() => {
    setColumnOrder(defaultOrder);
    setHiddenColumns(new Set());
  }, [resetTrigger, defaultOrder]);

  const columns = useMemo(() => {
    const colMap = new Map(allColumns.map((c) => [c.id, c]));
    return columnOrder
      .filter((id) => !hiddenColumns.has(id) && colMap.has(id))
      .map((id) => colMap.get(id));
  }, [allColumns, columnOrder, hiddenColumns]);

  const handleDragStart = useCallback((e, colId) => {
    if (colId === FIXED_COLUMN_ID) {
      e.preventDefault();
      return;
    }
    dragColRef.current = colId;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', colId);
  }, []);

  const handleDragOver = useCallback((e, colId) => {
    if (colId === FIXED_COLUMN_ID) return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colId);
  }, []);

  const handleDrop = useCallback((e, targetId) => {
    e.preventDefault();
    setDragOverCol(null);
    const sourceId = dragColRef.current;
    dragColRef.current = null;
    if (!sourceId || sourceId === targetId || targetId === FIXED_COLUMN_ID) return;
    setColumnOrder((prev) => {
      const next = [...prev];
      const fromIdx = next.indexOf(sourceId);
      const toIdx = next.indexOf(targetId);
      if (fromIdx === -1 || toIdx === -1) return prev;
      next.splice(fromIdx, 1);
      next.splice(toIdx, 0, sourceId);
      return next;
    });
  }, []);

  const handleDragEnd = useCallback(() => {
    dragColRef.current = null;
    setDragOverCol(null);
  }, []);

  const handleHideColumn = useCallback((colId) => {
    if (colId === FIXED_COLUMN_ID) return;
    setHiddenColumns((prev) => new Set(prev).add(colId));
  }, []);

  const tableRef = useRef(null);
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = useMemo(() => {
    const from = currentPage * pageSize;
    return items.slice(from, from + pageSize);
  }, [items, currentPage, pageSize]);

  const formatNumber = (value) =>
    new Intl.NumberFormat('ru-RU').format(Math.round(Number(value) || 0));

  const formatStockNumber = (v) =>
    new Intl.NumberFormat('ru-RU').format(Math.round(v));

  /** Сводка простого значения (не процент): до 2 знаков, без хвостовых нулей. */
  const formatValue = (value) => {
    const num = Number(value) || 0;
    return Math.round(num * 100) / 100;
  };

  /** Сводка значения, уже выраженного в процентах (0–100), со знаком «%». */
  const formatPercent = (value) => `${(Number(value) || 0).toFixed(2)} %`;

  const CHART_COLUMNS = new Set([
    'orders',
    'sales',
    'stocks',
    'ebitdaDay',
    'ebitdaNoAds',
    'ads',
    'cpoClean',
    'cpsClean',
    'cpoSpread',
    'cpsSpread',
    'ebitdaAvg',
    'ebitdaByOrders',
    'avgPrice',
    'avgBuyout',
    'crClickToCart',
    'crCartToOrder',
    'crClickToOrder',
  ]);

  const renderCell = (item, column) => {
    if (column.id === FIXED_COLUMN_ID) {
      return <span className={styles.categoryText}>{item.category}</span>;
    }
    if (column.id === 'skusCount') {
      const value = item[column.key];
      if (value === null || value === undefined || value === '') return '—';
      return <span className={styles.skusCountNumber}>{formatNumber(value)}</span>;
    }
    if (column.id === 'ebitdaNoAds') {
      const s = item.totalEbitdaTotalWithoutAdsSum;
      return (
        <LazyChart height={60}>
          <BarChart
            data={item.totalEbitdaTotalWithoutAds || {}}
            summary={
              s === null || s === undefined || s === '' ? '—' : formatNumber(s)
            }
            summaryColor={Number(s) < 0 ? '#ff3b3b' : undefined}
            height={60}
          />
        </LazyChart>
      );
    }
    if (column.id === 'ads') {
      return (
        <LazyChart height={60}>
          <BarChart
            data={item.adsCosts || {}}
            summary={formatNumber(item.adsCostsSum)}
            height={60}
          />
        </LazyChart>
      );
    }
    if (
      column.id === 'cpoClean' ||
      column.id === 'cpsClean' ||
      column.id === 'cpoSpread' ||
      column.id === 'cpsSpread'
    ) {
      const chartCf = {
        cpoClean: ['cpoClean', 'cpoCleanAvg'],
        cpsClean: ['cpsClean', 'cpsCleanAvg'],
        cpoSpread: ['cpoRaw', 'cpoRawAvg'],
        cpsSpread: ['cpsRaw', 'cpsRawAvg'],
      }[column.id];
      return (
        <LazyChart height={60}>
          <LineChart
            data={item[chartCf[0]] || {}}
            summary={formatValue(item[chartCf[1]])}
            height={60}
          />
        </LazyChart>
      );
    }
    if (column.id === 'ebitdaAvg' || column.id === 'ebitdaByOrders') {
      const chartCf = {
        ebitdaAvg: ['avgEbitdaOfSku', 'avgEbitdaOfSkuAvg'],
        ebitdaByOrders: ['ebitdaByOrders', 'ebitdaByOrdersAvg'],
      }[column.id];
      const s = item[chartCf[1]];
      return (
        <LazyChart height={60}>
          <SignedLineChart
            data={item[chartCf[0]] || {}}
            summary={
              s === null || s === undefined || s === '' ? '—' : formatNumber(s)
            }
            summaryColor={Number(s) < 0 ? '#ff3b3b' : undefined}
            height={60}
          />
        </LazyChart>
      );
    }
    if (column.id === 'avgPrice') {
      const s = item.avgPriceAvg;
      return (
        <LazyChart height={60}>
          <StepLineChart
            data={item.avgPrice || {}}
            summary={
              s === null || s === undefined || s === '' ? '—' : formatNumber(s)
            }
            height={60}
          />
        </LazyChart>
      );
    }
    if (column.id === 'avgBuyout') {
      return (
        <LazyChart height={60}>
          <LineChart
            data={item.avgBuyoutPercent || {}}
            summary={formatPercent(item.avgBuyoutPercentMedian)}
            benchmark={item.competitorBuyoutPercent}
            height={60}
          />
        </LazyChart>
      );
    }
    if (
      column.id === 'crClickToCart' ||
      column.id === 'crCartToOrder' ||
      column.id === 'crClickToOrder'
    ) {
      const chartCf = {
        crClickToCart: {
          numerator: () => item.addingsToCart,
          numeratorSum: () => item.addingsToCartSum,
          denominator: () => item.clicks,
          denominatorSum: () => item.clicksSum,
        },
        crCartToOrder: {
          numerator: () => sumDailyMap(item.ordersFbs, item.ordersFbw),
          numeratorSum: () => item.ordersTotalSum,
          denominator: () => item.addingsToCart,
          denominatorSum: () => item.addingsToCartSum,
        },
        crClickToOrder: {
          numerator: () => sumDailyMap(item.ordersFbs, item.ordersFbw),
          numeratorSum: () => item.ordersTotalSum,
          denominator: () => item.clicks,
          denominatorSum: () => item.clicksSum,
        },
      }[column.id];
      return (
        <LazyChart height={60}>
          <LineChart
            data={divideDailyPercent(
              chartCf.numerator(),
              chartCf.denominator()
            )}
            summary={percentRatio(
              chartCf.numeratorSum(),
              chartCf.denominatorSum()
            )}
            height={60}
          />
        </LazyChart>
      );
    }
    if (column.id === 'avgSelfprice') {
      return <CategorySelfPriceCell item={item} />;
    }
    if (column.id === 'orders') {
      return (
        <LazyChart height={60}>
          <StackedBarChart
            datasets={[
              {
                name: 'FBW',
                color: '#7c5ce8',
                negativeColor: '#ff4d4d',
                summary: Number(item.ordersFbwSum) || 0,
                data: item.ordersFbw || {},
              },
              {
                name: 'FBS',
                color: '#00bfa6',
                negativeColor: '#ff8c00',
                summary: Number(item.ordersFbsSum) || 0,
                data: item.ordersFbs || {},
              },
            ]}
            total={(Number(item.ordersFbwSum) || 0) + (Number(item.ordersFbsSum) || 0)}
            height={60}
          />
        </LazyChart>
      );
    }
    if (column.id === 'sales') {
      return (
        <LazyChart height={60}>
          <StackedBarChart
            datasets={[
              {
                name: 'FBW',
                color: '#7c5ce8',
                negativeColor: '#ff4d4d',
                summary: Number(item.salesFbwSum) || 0,
                data: item.salesFbw || {},
              },
              {
                name: 'FBS',
                color: '#00bfa6',
                negativeColor: '#ff8c00',
                summary: Number(item.salesFbsSum) || 0,
                data: item.salesFbs || {},
              },
            ]}
            total={(Number(item.salesFbwSum) || 0) + (Number(item.salesFbsSum) || 0)}
            height={60}
          />
        </LazyChart>
      );
    }
    if (column.id === 'stocks') {
      const fbwLast = lastDaily(item.stocksFbw);
      const fbsLast = lastDaily(item.stocksFbs);
      return (
        <LazyChart height={60}>
          <StackedBarChart
            datasets={[
              {
                name: 'FBW',
                color: '#7c5ce8',
                negativeColor: '#ff4d4d',
                summary: fbwLast || 0,
                data: item.stocksFbw || {},
              },
              {
                name: 'FBS',
                color: '#00bfa6',
                negativeColor: '#ff8c00',
                summary: fbsLast || 0,
                data: item.stocksFbs || {},
              },
            ]}
            total={(fbwLast || 0) + (fbsLast || 0)}
            height={60}
          />
        </LazyChart>
      );
    }
    if (column.id === 'stocksLast') {
      const fbw = Number(item.stocksFbwCurrent) || 0;
      const fbs = Number(item.stocksFbsCurrent) || 0;
      const way =
        (Number(item.quantityOnWayToClientCurrent) || 0) +
        (Number(item.quantityOnWayToWarehouseCurrent) || 0);
      const total = fbw + fbs + way;
      const lines = [
        { label: 'Остатки FBW', value: fbw },
        { label: 'Остатки FBS', value: fbs },
        { label: 'В пути', value: way },
        { label: 'Всего', value: total, strong: true },
      ];
      return (
        <div className={styles.stocksLines}>
          {lines.map((line) => (
            <span
              key={line.label}
              className={`${styles.stocksLine} ${line.strong ? styles.stocksLineStrong : ''}`}
            >
              <span className={styles.stocksLineLabel}>{line.label}</span>
              <b className={styles.stocksLineValue}>{formatStockNumber(line.value)}</b>
            </span>
          ))}
        </div>
      );
    }
    if (column.id === 'ebitdaDay') {
      return (
        <LazyChart height={60}>
          <StackedBarChart
            datasets={[
              {
                name: 'FBW',
                color: '#7c5ce8',
                negativeColor: '#ff4d4d',
                summary: Number(item.totalEbitdaBySkusFbwSum) || 0,
                data: item.totalEbitdaBySkusFbw || {},
              },
              {
                name: 'FBS',
                color: '#00bfa6',
                negativeColor: '#ff8c00',
                summary: Number(item.totalEbitdaBySkusFbsSum) || 0,
                data: item.totalEbitdaBySkusFbs || {},
              },
            ]}
            total={(Number(item.totalEbitdaBySkusFbwSum) || 0) + (Number(item.totalEbitdaBySkusFbsSum) || 0)}
            height={60}
          />
        </LazyChart>
      );
    }
    const value = item[column.key];
    if (value === null || value === undefined || value === '') return '—';
    const num = Number(value);
    if (Number.isFinite(num)) return formatNumber(num);
    return String(value);
  };

  const headerCellClass = (column) =>
    `${styles.headerCell} ${column.id === FIXED_COLUMN_ID ? styles.fixedCol : ''}`;

  const bodyCellClass = (column) => {
    if (column.id === FIXED_COLUMN_ID) {
      return `${styles.cell} ${styles.fixedCol}`;
    }
    if (column.id === 'skusCount') {
      return `${styles.cell} ${styles.centerCell}`;
    }
    if (column.id === 'avgSelfprice') {
      return `${styles.cell} ${styles.selfPriceColumn}`;
    }
    if (CHART_COLUMNS.has(column.id)) {
      return `${styles.cell} ${styles.chartCell}`;
    }
    if (column.id === 'stocksLast') {
      return `${styles.cell} ${styles.linesCell}`;
    }
    return styles.cell;
  };

  const renderHeaderCells = () =>
    columns.map((column) => {
      const isFixed = column.id === FIXED_COLUMN_ID;
      return (
        <div
          key={column.id}
          className={`${headerCellClass(column)} ${dragOverCol === column.id ? styles.dragOver : ''}`}
          style={{ width: column.width }}
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          {!isFixed && (
            <span
              className={styles.dragHandle}
              draggable
              onDragStart={(e) => handleDragStart(e, column.id)}
              onDragEnd={handleDragEnd}
              title="Перетащить колонку"
            >
              <MdDragIndicator />
            </span>
          )}
          <HeaderLabel>{column.label}</HeaderLabel>
          {!isFixed && (
            <button
              type="button"
              className={styles.hideColBtn}
              title="Скрыть колонку"
              onClick={() => handleHideColumn(column.id)}
            >
              <IoMdCloseCircle />
            </button>
          )}
        </div>
      );
    });

  const renderBodyCells = (item, index) =>
    columns.map((column) => (
      <div
        key={column.id}
        className={bodyCellClass(column)}
        style={{ width: column.width }}
      >
        {renderCell(item, column)}
      </div>
    ));

  return (
    <>
      <div className={styles.table} ref={tableRef} data-istablescroll>
        <div className={styles.tableContent}>
          <div className={styles.headerRow}>{renderHeaderCells()}</div>
          <div className={styles.body}>
            {pageItems.map((item, index) => (
              <div key={String(item.category ?? index)} className={styles.row}>
                {renderBodyCells(item, index)}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.pagination}>
        <select
          className={styles.pageSize}
          value={pageSize}
          onChange={(e) => {
            setPageSize(Number(e.target.value));
            setPage(0);
          }}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
            <option key={size} value={size}>
              {size}
            </option>
          ))}
        </select>

        <span className={styles.pageInfo}>
          {totalCount === 0
            ? '0 строк'
            : `${currentPage * pageSize + 1}–${Math.min(
                (currentPage + 1) * pageSize,
                totalCount
              )} из ${totalCount}`}
        </span>

        <div className={styles.pageButtons}>
          <button
            type="button"
            className={styles.pageButton}
            title="На первую страницу"
            disabled={currentPage === 0}
            onClick={() => setPage(0)}
          >
            «
          </button>
          <button
            type="button"
            className={styles.pageButton}
            title="На предыдущую страницу"
            disabled={currentPage === 0}
            onClick={() => setPage((p) => Math.max(0, p - 1))}
          >
            ‹
          </button>
          <span className={styles.pageNumber}>
            {currentPage + 1} / {totalPages}
          </span>
          <button
            type="button"
            className={styles.pageButton}
            title="На следующую страницу"
            disabled={currentPage >= totalPages - 1}
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
          >
            ›
          </button>
          <button
            type="button"
            className={styles.pageButton}
            title="На последнюю страницу"
            disabled={currentPage >= totalPages - 1}
            onClick={() => setPage(totalPages - 1)}
          >
            »
          </button>
        </div>
      </div>
    </>
  );
};

export default CategoriesTable;