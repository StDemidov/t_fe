import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { MdDragIndicator } from 'react-icons/md';
import { IoMdCloseCircle } from 'react-icons/io';
import LazyLoad from 'react-lazyload';

import { getVisibleColumns, sumDaily, lastDaily } from './columns';
import { BarChart, LineChart, StackedBarChart, StepLineChart } from '../../shared/ui';
import ArticleCell from './ArticleCell';
import SelfPriceCell from './SelfPriceCell';
import TagsCell from './TagsCell';
import styles from './SkusTable.module.css';

/** Варианты количества строк на странице. */
export const PAGE_SIZE_OPTIONS = [25, 50, 100];

/**
 * Подпись колонки в шапке: если текст не помещается, при наведении он едет
 * влево до конца, затем отматывается назад к началу — и так по кругу
 * (маятник). Скорость подбирается по объёму переполнения.
 */
const HeaderLabel = ({ children }) => {
  const wrapRef = useRef(null);
  const textRef = useRef(null);
  const [overflows, setOverflows] = useState(false);

  useLayoutEffect(() => {
    const check = () => {
      if (textRef.current && wrapRef.current) {
        setOverflows(
          textRef.current.scrollWidth > wrapRef.current.clientWidth
        );
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
  // Примерно одинаковая скорость прокрутки независимо от длины текста.
  const dur = Math.max(4, shift / 31.2);

  return (
    <span
      ref={wrapRef}
      className={`${styles.headerLabel} ${overflows ? styles.headerLabelMarquee : ''}`}
    >
      <span
        ref={textRef}
        className={styles.headerLabelText}
        style={
          overflows
            ? { '--shift': `${shift}px`, '--dur': `${dur}s` }
            : undefined
        }
      >
        {children}
      </span>
    </span>
  );
};

/**
 * Ленивая обёртка графика: строит диаграмму только когда она попадает в зону
 * видимости (относительно скролл-контейнера таблицы). Резко сокращает число
 * DOM-узлов при отрисовке таблицы, т.к. графики вне экрана не строятся.
 *
 * Селектор скролл-контейнера берётся как строка (устойчив к обновлениям
 * таблицы), а не через ref.current — при первом рендере реф ещё может быть
 * пустым, а строка всегда валидна.
 */
const LazyChart = ({ height, children }) => {
  return (
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
};

/**
 * Таблица метрик SKU.
 *
 * Поддерживает перетаскивание колонок за маркер (drag handle) и скрытие
 * колонок крестиком. Состояние порядка и видимости управляется через
 * columnOrder (массив ID) и hiddenColumns (Set). resetTrigger сбрасывает
 * всё к исходному порядку.
 */
const SkusTable = ({ items, footerItems = [], onTagFilter, onCategoryFilter, onPatternFilter, onAbcAllFilter, onAbcCategoryFilter, resetTrigger = 0 }) => {
  const allColumns = useMemo(() => getVisibleColumns(), []);
  const defaultOrder = useMemo(() => allColumns.map((c) => c.id), [allColumns]);

  const [columnOrder, setColumnOrder] = useState(defaultOrder);
  const [hiddenColumns, setHiddenColumns] = useState(() => new Set());
  const dragColRef = useRef(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  // Сброс порядка и видимости при смене resetTrigger.
  useEffect(() => {
    setColumnOrder(defaultOrder);
    setHiddenColumns(new Set());
  }, [resetTrigger, defaultOrder]);

  // Видимые колонки в текущем порядке.
  const columns = useMemo(() => {
    const colMap = new Map(allColumns.map((c) => [c.id, c]));
    return columnOrder
      .filter((id) => !hiddenColumns.has(id) && colMap.has(id))
      .map((id) => colMap.get(id));
  }, [allColumns, columnOrder, hiddenColumns]);

  /** Перетаскивание колонок. article не перемещается. */
  const handleDragStart = useCallback((e, colId) => {
    if (colId === 'article') { e.preventDefault(); return; }
    dragColRef.current = colId;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', colId);
  }, []);

  const handleDragOver = useCallback((e, colId) => {
    if (colId === 'article') return;
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverCol(colId);
  }, []);

  const handleDrop = useCallback((e, targetId) => {
    e.preventDefault();
    setDragOverCol(null);
    const sourceId = dragColRef.current;
    dragColRef.current = null;
    if (!sourceId || sourceId === targetId || targetId === 'article') return;
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

  /** Скрытие колонки. article не скрывается. */
  const handleHideColumn = useCallback((colId) => {
    if (colId === 'article') return;
    setHiddenColumns((prev) => new Set(prev).add(colId));
  }, []);

  // Единый скролл-контейнер таблицы: шапка/тело/футер и закреплённая слева
  // колонка «Артикул» живут внутри и закрепляются через position: sticky,
  // поэтому горизонтальный и вертикальный скролл синхронны без JS.
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

  // Итоговые суммы по всем отфильтрованным товарам (все страницы).
  // Используем те же предвычисленные поля, что и в сортировке.
  const footerTotals = useMemo(() => {
    const reduce = (field) =>
      footerItems.reduce((sum, item) => sum + (Number(item[field]) || 0), 0);
    // Суммирует несколько полей артикула (напр. «В пути» = клиент + склад).
    const reduceSum = (...fields) =>
      footerItems.reduce(
        (sum, item) =>
          sum +
          fields.reduce((s, f) => s + (Number(item[f]) || 0), 0),
        0
      );

    /** Сумма сумм по дням дневного поля {дата: значение}. */
    const reduceDaily = (field) =>
      footerItems.reduce((sum, item) => sum + sumDaily(item[field]), 0);

    /** Медиана по числовому полю. */
    const median = (field) => {
      const vals = footerItems
        .map((item) => Number(item[field]))
        .filter((v) => Number.isFinite(v))
        .sort((a, b) => a - b);
      if (vals.length === 0) return 0;
      const mid = Math.floor(vals.length / 2);
      return vals.length % 2
        ? vals[mid]
        : (vals[mid - 1] + vals[mid]) / 2;
    };

    /** Среднее последних не-Null значений дневного датасета. */
    const avgLastNonNull = (field) => {
      const vals = footerItems
        .map((item) => lastDaily(item[field]))
        .filter((v) => v !== null && v !== undefined && Number.isFinite(v));
      if (vals.length === 0) return 0;
      return vals.reduce((sum, v) => sum + v, 0) / vals.length;
    };

    /** Среднее по числовому полю. */
    const avg = (field) => {
      const vals = footerItems
        .map((item) => Number(item[field]))
        .filter((v) => Number.isFinite(v));
      if (vals.length === 0) return 0;
      return vals.reduce((sum, v) => sum + v, 0) / vals.length;
    };

    const stocksLastFbw = reduce('stocksFbwCurrent');
    const stocksLastFbs = reduce('stocksFbsCurrent');
    const stocksLastWay = reduceSum(
      'quantityOnWayToClientCurrent',
      'quantityOnWayToWarehouseCurrent'
    );
    // ROI — среднее среди валидных значений (в долях), null пропускаются.
    let roiSum = 0;
    let roiCount = 0;
    footerItems.forEach((item) => {
      const v = item.roi;
      if (v === null || v === undefined || !Number.isFinite(Number(v))) return;
      roiSum += Number(v);
      roiCount += 1;
    });
    const roiAvgVal = roiCount === 0 ? 0 : roiSum / roiCount;
    return {
      ordersFbs: reduce('ordersSumFbs'),
      ordersFbw: reduce('ordersSumFbw'),
      orders: reduce('ordersSum'),
      salesFbs: reduce('salesSumFbs'),
      salesFbw: reduce('salesSumFbw'),
      sales: reduce('salesSum'),
      stocksFbs: reduce('stocksLastFbs'),
      stocksFbw: reduce('stocksLastFbw'),
      stocks: reduce('stocksLast'),
      ebitdaDayFbs: reduceDaily('totalEbitdaFbs'),
      ebitdaDayFbw: reduceDaily('totalEbitdaFbw'),
      ebitdaDay: reduceDaily('totalEbitdaFbs') + reduceDaily('totalEbitdaFbw'),
      ads: reduce('adsCostsSum'),
      ebitdaNoAds: reduce('ebitdaNoAdsSum'),
      addings: reduce('totalAddingsToCart'),
      clicks: reduce('totalClicks'),
      stocksLastFbw,
      stocksLastFbs,
      stocksLastWay,
      stocksLastTotal: stocksLastFbw + stocksLastFbs + stocksLastWay,
      // CPO/CPS — среднее среди саммари по артикулам.
      cpoAvg: avg('avgCpo'),
      cpsAvg: avg('avgCps'),
      // Процент выкупа — медиана среди медианных процентов выкупа.
      buyoutMedian: median('medianBuyoutPercent'),
      // EBITDA / Цена — среднее среди не-Null последних значений по дням.
      ebitdaLastAvg: avgLastNonNull('ebitda'),
      priceLastAvg: avgLastNonNull('price'),
      // ROI — среднее среди валидных значений (в долях), null пропускаются.
      roiAvg: roiAvgVal,
    };
  }, [footerItems]);

  const renderCell = (item, column) => {
    if (column.id === 'article') {
      return (
        <ArticleCell
          item={item}
          onCategoryFilter={onCategoryFilter}
          onPatternFilter={onPatternFilter}
          onAbcAllFilter={onAbcAllFilter}
          onAbcCategoryFilter={onAbcCategoryFilter}
        />
      );
    }
    if (column.id === 'selfprice') {
      return <SelfPriceCell item={item} />;
    }
    if (column.id === 'tags' || column.id === 'tagsCloth' || column.id === 'tagsAdditional') {
      const tagType =
        column.id === 'tags' ? 'main' : column.id === 'tagsCloth' ? 'cloth' : 'others';
      return (
        <TagsCell
          tags={item[column.key]}
          sku={item.sku}
          type={tagType}
          scrollLockRef={tableRef}
          onTagFilter={onTagFilter}
        />
      );
    }
    if (column.id === 'ads') {
      return (
        <LazyChart height={60}>
          <BarChart
            data={item.adsCosts || {}}
            summary={sumDaily(item.adsCosts)}
            height={60}
          />
        </LazyChart>
      );
    }
    if (
      column.id === 'crToCart' ||
      column.id === 'crCartToOrder' ||
      column.id === 'crClickToOrder'
    ) {
      const chartCf = {
        crToCart: ['crToCart', 'totalCrToCart'],
        crCartToOrder: ['crCartToOrder', 'totalCartToOrder'],
        crClickToOrder: ['crClickToOrder', 'totalClickToOrder'],
      }[column.id];
      return (
        <LazyChart height={60}>
          <LineChart
            data={item[chartCf[0]] || {}}
            summary={formatSummary(item[chartCf[1]])}
            height={60}
          />
        </LazyChart>
      );
    }
    if (column.id === 'cpo' || column.id === 'cps') {
      const chartCf = { cpo: ['cpo', 'avgCpo'], cps: ['cps', 'avgCps'] }[
        column.id
      ];
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
    if (column.id === 'roi') {
      const v = item.roi;
      if (v === null || v === undefined || !Number.isFinite(Number(v)))
        return '—';
      const cellClass =
        Number(v) > 1 ? styles.roiPositive : styles.roiNegative;
      return <span className={cellClass}>{formatPercent(v)}</span>;
    }
    if (column.id === 'buyout') {
      return (
        <LazyChart height={60}>
          <LineChart
            data={item.buyoutPercent || {}}
            summary={formatPercentValue(item.medianBuyoutPercent)}
            benchmark={item.medianCategoryBuyout}
            percent
            height={60}
          />
        </LazyChart>
      );
    }
    if (column.id === 'priceBeforeSpp') {
      return (
        <LazyChart height={60}>
          <StepLineChart
            data={item.price || {}}
            summary={formatNumber(lastDaily(item.price))}
            height={60}
          />
        </LazyChart>
      );
    }
    if (column.id === 'ebitda') {
      const s = lastDaily(item.ebitda);
      return (
        <LazyChart height={60}>
          <BarChart
            data={item.ebitda || {}}
            summary={s}
            summaryColor={s !== null && s < 0 ? '#ff3b3b' : undefined}
            height={60}
          />
        </LazyChart>
      );
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
                summary: sumDaily(item.ordersFbw),
                data: item.ordersFbw || {},
              },
              {
                name: 'FBS',
                color: '#00bfa6',
                negativeColor: '#ff8c00',
                summary: sumDaily(item.ordersFbs),
                data: item.ordersFbs || {},
              },
            ]}
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
                summary: sumDaily(item.salesFbw),
                data: item.salesFbw || {},
              },
              {
                name: 'FBS',
                color: '#00bfa6',
                negativeColor: '#ff8c00',
                  summary: sumDaily(item.salesFbs),
                  data: item.salesFbs || {},
                },
            ]}
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
      const fmt = (v) =>
        new Intl.NumberFormat('ru-RU').format(Math.round(v));
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
              <b className={styles.stocksLineValue}>{fmt(line.value)}</b>
            </span>
          ))}
        </div>
      );
    }
    if (
      column.id === 'turnoverFbs' ||
      column.id === 'turnoverFbw' ||
      column.id === 'turnoverTotal'
    ) {
      // Поле может прийти скаляром или словарём {дата: значение} (как остальные
      // поля Fbs/Fbw) — в обоих случаях достаём итоговую величину.
      const raw = item[column.key];
      const byOrders =
        raw && typeof raw === 'object' && !Array.isArray(raw)
          ? Number(lastDaily(raw)) || 0
          : Number(raw) || 0;
      const medianBuyout = Number(item.medianBuyout) || 0;
      const byBuyout = medianBuyout !== 0 ? byOrders / medianBuyout : null;
      const fmt = (v) =>
        v === null || v === undefined || !Number.isFinite(Number(v))
          ? '—'
          : new Intl.NumberFormat('ru-RU', {
              maximumFractionDigits: 0,
            }).format(Math.round(Number(v)));
      const valueClass = (v) =>
        Number(v) === 0 ? styles.turnoverZero : undefined;
      const lines = [
        { label: 'По заказам', value: byOrders },
        { label: 'По выкупам', value: byBuyout },
      ];
      return (
        <div className={styles.stocksLines}>
          {lines.map((line) => (
            <span key={line.label} className={styles.stocksLine}>
              <span className={styles.stocksLineLabel}>{line.label}</span>
              <b
                className={`${styles.stocksLineValue} ${valueClass(line.value) || ''}`}
              >
                {fmt(line.value)}
              </b>
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
                summary: sumDaily(item.totalEbitdaFbw),
                data: item.totalEbitdaFbw || {},
            },
            {
              name: 'FBS',
              color: '#00bfa6',
              negativeColor: '#ff8c00',
              summary: sumDaily(item.totalEbitdaFbs),
              data: item.totalEbitdaFbs || {},
            },
          ]}
          height={60}
        />
      </LazyChart>
      );
    }
    if (column.id === 'ebitdaNoAds') {
      const s = item.ebitdaNoAdsSum;
      return (
        <LazyChart height={60}>
          <BarChart
            data={item.ebitdaNoAds || {}}
            summary={formatNumber(s)}
            summaryColor={s !== undefined && s < 0 ? '#ff3b3b' : undefined}
            height={60}
          />
        </LazyChart>
      );
    }
    const value = column.render ? column.render(item) : item[column.key];
    if (Array.isArray(value)) return value.join(', ') || '—';
    if (value === null || value === undefined) return '—';
    return value;
  };

  const headerCellClass = (column) =>
    `${styles.headerCell} ${column.id === 'article' ? styles.fixedCol : ''}`;

  // Колонки, чей футер рендерится строками «название + значение».
const FOOTER_LINES_COLUMNS = new Set([
  'stocksLast',
  'orders',
  'sales',
  'stocks',
  'ebitdaDay',
]);

const footerCellClass = (column) =>
    `${styles.footerCell} ${column.id === 'article' ? styles.fixedCol : ''} ${
      FOOTER_LINES_COLUMNS.has(column.id) ? styles.footerCellLines : ''
    }`;

  const bodyCellClass = (column) =>
    column.id === 'article'
      ? `${styles.cell} ${styles.fixedCol}`
      : column.id === 'selfprice'
      ? `${styles.cell} ${styles.selfPriceColumn}`
      : column.id === 'stocksLast' || column.id === 'turnoverFbs' || column.id === 'turnoverFbw' || column.id === 'turnoverTotal'
      ? `${styles.cell} ${styles.stocksLastColumn}`
      : column.id === 'ads' || column.id === 'orders' || column.id === 'sales' || column.id === 'stocks' || column.id === 'ebitdaDay' || column.id === 'ebitdaNoAds' || column.id === 'ebitda' || column.id === 'crToCart' || column.id === 'crCartToOrder' || column.id === 'crClickToOrder' || column.id === 'cpo' || column.id === 'cps' || column.id === 'roi' || column.id === 'buyout' || column.id === 'priceBeforeSpp'
      ? `${styles.cell} ${styles.adsCell}`
      : column.id === 'tags' || column.id === 'tagsCloth' || column.id === 'tagsAdditional'
      ? `${styles.cell} ${styles.tagsCell}`
      : styles.cell;

  const renderHeaderCells = () =>
    columns.map((column) => {
      const isArticle = column.id === 'article';
      return (
        <div
          key={column.id}
          className={`${headerCellClass(column)} ${dragOverCol === column.id ? styles.dragOver : ''}`}
          style={{ width: column.width }}
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          {!isArticle && (
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
          {!isArticle && (
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

  /** Форматирует число с разделителями тысяч. */
  const formatNumber = (value) =>
    new Intl.NumberFormat('ru-RU').format(Math.round(Number(value) || 0));

  /** Процентная сводка: значение с двумя знаками и знаком %. */
  const formatSummary = (value) =>
    `${(Number(value) || 0).toFixed(2)} %`;

  /** Сводка простого значения (не процент): до 2 знаков, без хвостовых нулей. */
  const formatValue = (value) => {
    const num = Number(value) || 0;
    return Math.round(num * 100) / 100;
  };

  /** Сводка доли (0–1) как процент: значение×100 с двумя знаками и знаком %. */
  const formatPercentValue = (value) =>
    `${((Number(value) || 0) * 100).toFixed(2)} %`;

  /** Форматирует долю как процент (для ROI): значение×100, два знака, знак %. */
  const formatPercent = (value) => {
    const v = Number(value) || 0;
    return `${(v * 100).toFixed(2)} %`;
  };

  /** Содержимое ячейки футера для колонки по итогам отфильтрованных товаров. */
  const footerCellContent = (column) => {
    const breakdown = {
      orders: ['ordersFbs', 'ordersFbw', 'orders'],
      sales: ['salesFbs', 'salesFbw', 'sales'],
      stocks: ['stocksFbs', 'stocksFbw', 'stocks'],
      ebitdaDay: ['ebitdaDayFbs', 'ebitdaDayFbw', 'ebitdaDay'],
    }[column.id];

    // Колонки с разбивкой FBS / FBW / Всего: итоговая строка «Всего» внизу.
    if (breakdown) {
      const [fbs, fbw, total] = breakdown;
      const lines = [
        { label: 'FBS', value: footerTotals[fbs] },
        { label: 'FBW', value: footerTotals[fbw] },
        { label: 'Всего', value: footerTotals[total], strong: true },
      ];
      return (
        <div className={styles.stocksLines}>
          {lines.map((line) => (
            <span
              key={line.label}
              className={`${styles.stocksLine} ${line.strong ? styles.stocksLineStrong : ''}`}
            >
              <span className={styles.stocksLineLabel}>{line.label}</span>
              <b className={styles.stocksLineValue}>{formatNumber(line.value)}</b>
            </span>
          ))}
        </div>
      );
    }

    if (column.id === 'ads') {
      return formatNumber(footerTotals.ads);
    }

    if (column.id === 'ebitdaNoAds') {
      return formatNumber(footerTotals.ebitdaNoAds);
    }

    // Колонки CR: процент из суммарных по всем отфильтрованным товарам.
    const crRatio = {
      crToCart: ['addings', 'clicks'],
      crCartToOrder: ['orders', 'addings'],
      crClickToOrder: ['orders', 'clicks'],
    }[column.id];

    if (crRatio) {
      const [numerator, denominator] = crRatio;
      const den = footerTotals[denominator];
      const ratio = den !== 0 ? footerTotals[numerator] / den : 0;
      return formatSummary(ratio * 100);
    }

    // CPO/CPS — среднее среди саммари по артикулам.
    if (column.id === 'cpo') {
      return formatValue(footerTotals.cpoAvg);
    }

    if (column.id === 'cps') {
      return formatValue(footerTotals.cpsAvg);
    }

    // ROI — среднее среди артикулов.
    if (column.id === 'roi') {
      return formatPercent(footerTotals.roiAvg);
    }

    // Процент выкупа — медиана среди всех артикулов.
    if (column.id === 'buyout') {
      return formatPercentValue(footerTotals.buyoutMedian);
    }

    // EBITDA — среднее среди не-Null последних значений.
    if (column.id === 'ebitda') {
      return formatNumber(footerTotals.ebitdaLastAvg);
    }

    // Цена до СПП — среднее среди не-Null последних значений.
    if (column.id === 'priceBeforeSpp') {
      return formatNumber(footerTotals.priceLastAvg);
    }

    // Колонка «Остатки последние»: итоги по отфильтрованным товарам.
    if (column.id === 'stocksLast') {
      const lines = [
        { label: 'Остатки FBW', value: footerTotals.stocksLastFbw },
        { label: 'Остатки FBS', value: footerTotals.stocksLastFbs },
        { label: 'В пути', value: footerTotals.stocksLastWay },
        {
          label: 'Всего',
          value: footerTotals.stocksLastTotal,
          strong: true,
        },
      ];
      return (
        <div className={styles.stocksLines}>
          {lines.map((line) => (
            <span
              key={line.label}
              className={`${styles.stocksLine} ${line.strong ? styles.stocksLineStrong : ''}`}
            >
              <span className={styles.stocksLineLabel}>{line.label}</span>
              <b className={styles.stocksLineValue}>{formatNumber(line.value)}</b>
            </span>
          ))}
        </div>
      );
    }

    return '';
  };

  const renderFooterCells = () =>
    columns.map((column) => (
      <div
        key={column.id}
        className={footerCellClass(column)}
        style={{ width: column.width }}
      >
        {footerCellContent(column)}
      </div>
    ));

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
          {/* Шапка: закрепляется сверху внутри скролл-контейнера. */}
          <div className={styles.headerRow}>{renderHeaderCells()}</div>

          {/* Тело: строки, каждая — флекс-ряд всех колонок. */}
          <div className={styles.body}>
            {pageItems.map((item, index) => (
              <div key={item.sku ?? index} className={styles.row}>
                {renderBodyCells(item)}
              </div>
            ))}
          </div>

          {/* Футер: закрепляется снизу внутри скролл-контейнера. */}
          <div className={styles.footerRow}>{renderFooterCells()}</div>
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
            onClick={() =>
              setPage((p) => Math.min(totalPages - 1, p + 1))
            }
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

export default SkusTable;
