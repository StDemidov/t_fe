import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import LazyLoad from 'react-lazyload';
import * as XLSX from 'xlsx';
import { MdDragIndicator } from 'react-icons/md';
import { FaFileExcel } from 'react-icons/fa';
import { IoMdCloseCircle } from 'react-icons/io';
import { PiEmptyDuotone } from 'react-icons/pi';
import { VscCircleLargeFilled } from 'react-icons/vsc';

import {
  COLUMNS,
  FIXED_COLUMN_IDS,
  FIXED_RIGHT_COLUMN_ID,
  sumDaily,
} from './columns';
import { BarChart, LineChart } from '../../../shared/ui';
import ArticleCell from './ArticleCell';
import RkInfoCell from './RkInfoCell';
import FixationCell from './FixationCell';
import StatusCell from './StatusCell';
import BidCell from './BidCell';
import BudgetCell from './BudgetCell';
import ActiveHoursCell from './ActiveHoursCell';
import TurnoverCell from './TurnoverCell';
import ThresholdsCell from './ThresholdsCell';
import ClusterMetricsCell from './ClusterMetricsCell';
import ActionsCell from './ActionsCell';
import {
  PAUSABLE_STATUSES,
  RESUMABLE_STATUSES,
  FINISHABLE_STATUSES,
  SETTINGS_BLOCKED_STATUSES,
  DELETED_STATUS,
} from './statuses';
import styles from './PromoTable.module.css';

/** Колонка закреплена (слева или справа) — нельзя двигать и скрывать. */
const isFixedColumn = (id) =>
  FIXED_COLUMN_IDS.includes(id) || id === FIXED_RIGHT_COLUMN_ID;

/** Исходная ширина колонки «Артикул» (для растянутого режима). */
const ARTICLE_WIDTH =
  (COLUMNS.find((c) => c.id === 'article') || {}).width || 280;

/**
 * Стиль колонки в растянутом режиме: все колонки тянутся на всю ширину,
 * «Артикул» сохраняет исходную ширину.
 */
const stretchStyle = (id) =>
  id === 'article'
    ? { flex: '0 0 auto', width: ARTICLE_WIDTH }
    : { flex: '1 1 0', minWidth: 0 };

/** Варианты количества строк на странице. */
export const PAGE_SIZE_OPTIONS = [25, 50, 100];

/** Сколько строк рисуем в скелетоне, пока грузится раздел. */
const SKELETON_ROWS = 8;

/** Единый цвет всех графиков (цвет колонки «Клики»). */
const CHART_COLOR = '#8254ff';

/** Саммари по колонкам: поле датасета → поле суммы. */
const SUMMARY_FIELDS = {
  spend: 'spendSum',
  views: 'viewsSum',
  clicks: 'clicksSum',
  addingsToCart: 'addingsToCartSum',
};

/** Колонки, содержимое которых центрируется в ячейке. */
const CENTERED_COLUMN_IDS = [
  'fixation',
  'status',
  'bids',
  'budget',
  'activeHours',
  'turnover',
  'thresholds',
  'clusterMetrics',
];

/** Колонки с линейными графиками: id → [поле датасета, поле саммари]. */
const LINE_CHART_FIELDS = {
  ctr: ['ctr', 'ctrTotal'],
  clickToCart: ['clickToCart', 'clickToCartTotal'],
  viewToCart: ['viewToCart', 'viewToCartTotal'],
};

/** Колонки с графиками (столбчатыми или линейными). */
const CHART_COLUMN_IDS = [
  ...Object.keys(SUMMARY_FIELDS),
  ...Object.keys(LINE_CHART_FIELDS),
];

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
 * Ленивая обёртка графика: строит диаграмму только когда она попадает
 * в зону видимости (относительно скролл-контейнера таблицы).
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

/** Форматирует число с разделителями тысяч. */
const formatNumber = (value) =>
  new Intl.NumberFormat('ru-RU').format(Math.round(Number(value) || 0));

/**
 * Таблица рекламных кампаний.
 *
 * Поддерживает перетаскивание колонок за маркер (drag handle) и скрытие
 * колонок крестиком. Состояние порядка и видимости управляется через
 * columnOrder (массив ID) и hiddenColumns (Set). resetTrigger сбрасывает
 * всё к исходному порядку. Колонка «Артикул» закреплена.
 *
 * @param {object} props
 * @param {Array<object>} props.items кампании раздела
 * @param {boolean} props.isLoading идёт ли загрузка (показывает скелетон)
 * @param {number} props.resetTrigger счётчик сброса колонок
 * @param {(category: string) => void} [props.onCategoryFilter] выставляет
 *   категорию в фильтр страницы
 * @param {(pattern: string) => void} [props.onPatternFilter] выставляет
 *   лекало в фильтр страницы
 * @param {(bidType: string) => void} [props.onBidTypeFilter] выставляет
 *   тип кампании в фильтр страницы
 * @param {boolean} [props.canSelect] разрешён ли выбор кампаний
 * @param {Set<number>} [props.selectedIds] выбранные id кампаний
 * @param {(id: number) => void} [props.onToggleSelect] переключает выбор одной
 * @param {() => void} [props.onSelectAll] выделяет все видимые страницы
 * @param {() => void} [props.onClearSelection] снимает выделение
 * @param {(ids: Array<string>) => void} [props.onImportIds] выбирает кампании из Excel
 * @param {boolean} [props.canManage] права на управление кампаниями
 * @param {(item: object) => void} [props.onPause] поставить кампанию на паузу
 * @param {(item: object) => void} [props.onResume] запустить кампанию
 * @param {(item: object) => void} [props.onFinish] завершить кампанию
 * @param {(item: object) => void} [props.onDelete] удалить кампанию
 * @param {(item: object) => void} [props.onSettings] настройки кампании
 * @param {(item: object) => void} [props.onOpen] перейти на страницу РК
 * @param {Array<string>} [props.columnIds] ограничить набор колонок (id)
 * @param {boolean} [props.stretch] колонки растягиваются на всю ширину,
 *   перетаскивание и скрытие отключены
 * @param {boolean} [props.compactRkInfo] компактная ячейка «Информация об РК»
 *   (только название и тип кампании)
 */
const PromoTable = ({
  items,
  isLoading,
  resetTrigger = 0,
  onCategoryFilter,
  onPatternFilter,
  onBidTypeFilter,
  canSelect = false,
  selectedIds,
  onToggleSelect,
  onSelectAll,
  onClearSelection,
  onImportIds,
  canManage = false,
  onPause,
  onResume,
  onFinish,
  onDelete,
  onSettings,
  onOpen,
  columnIds,
  stretch = false,
  compactRkInfo = false,
}) => {
  // Набор доступных колонок: по умолчанию все, иначе — только переданные.
  const availableColumns = useMemo(() => {
    if (!columnIds) return COLUMNS;
    const wanted = new Set(columnIds);
    return COLUMNS.filter((c) => wanted.has(c.id));
  }, [columnIds]);

  const defaultOrder = useMemo(
    () => availableColumns.map((c) => c.id),
    [availableColumns]
  );

  const [columnOrder, setColumnOrder] = useState(defaultOrder);
  const [hiddenColumns, setHiddenColumns] = useState(() => new Set());
  const dragColRef = useRef(null);
  const excelInputRef = useRef(null);
  const [dragOverCol, setDragOverCol] = useState(null);

  const handleImportIds = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file || !onImportIds) return;

    try {
      const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: '',
      });
      const ids = rows
        .map((row) => String(row?.[0] ?? '').trim())
        .filter(Boolean);
      onImportIds([...new Set(ids)]);
    } catch {
      onImportIds([]);
    }
  };

  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(PAGE_SIZE_OPTIONS[0]);

  // Сброс порядка и видимости при смене resetTrigger.
  useEffect(() => {
    setColumnOrder(defaultOrder);
    setHiddenColumns(new Set());
  }, [resetTrigger, defaultOrder]);

  // Смена раздела или перезагрузка данных возвращает на первую страницу.
  useEffect(() => {
    setPage(0);
  }, [items]);

  // Видимые колонки в текущем порядке.
  const columns = useMemo(() => {
    const colMap = new Map(availableColumns.map((c) => [c.id, c]));
    return columnOrder
      .filter((id) => !hiddenColumns.has(id) && colMap.has(id))
      .map((id) => colMap.get(id));
  }, [columnOrder, hiddenColumns, availableColumns]);

  /** Перетаскивание колонок. Закреплённые/растянутые колонки не двигаются. */
  const handleDragStart = useCallback(
    (e, colId) => {
      if (stretch || isFixedColumn(colId)) {
        e.preventDefault();
        return;
      }
      dragColRef.current = colId;
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/plain', colId);
    },
    [stretch]
  );

  const handleDragOver = useCallback(
    (e, colId) => {
      if (stretch || isFixedColumn(colId)) return;
      e.preventDefault();
      e.dataTransfer.dropEffect = 'move';
      setDragOverCol(colId);
    },
    [stretch]
  );

  const handleDrop = useCallback(
    (e, targetId) => {
      e.preventDefault();
      setDragOverCol(null);
      const sourceId = dragColRef.current;
      dragColRef.current = null;
      if (stretch || !sourceId || sourceId === targetId || isFixedColumn(targetId))
        return;
      setColumnOrder((prev) => {
        const next = [...prev];
        const fromIdx = next.indexOf(sourceId);
        const toIdx = next.indexOf(targetId);
        if (fromIdx === -1 || toIdx === -1) return prev;
        next.splice(fromIdx, 1);
        next.splice(toIdx, 0, sourceId);
        return next;
      });
    },
    [stretch]
  );

  const handleDragEnd = useCallback(() => {
    dragColRef.current = null;
    setDragOverCol(null);
  }, []);

  /** Скрытие колонки. Закреплённые/растянутые колонки не скрываются. */
  const handleHideColumn = useCallback(
    (colId) => {
      if (stretch || isFixedColumn(colId)) return;
      setHiddenColumns((prev) => new Set(prev).add(colId));
    },
    [stretch]
  );

  // Единый скролл-контейнер таблицы: шапка/тело и закреплённая слева
  // колонка «Артикул» живут внутри и закрепляются через position: sticky.
  const tableRef = useRef(null);

  const totalCount = items.length;
  const totalPages = Math.max(1, Math.ceil(totalCount / pageSize));
  const currentPage = Math.min(page, totalPages - 1);
  const pageItems = useMemo(() => {
    const from = currentPage * pageSize;
    return items.slice(from, from + pageSize);
  }, [items, currentPage, pageSize]);

  const renderCell = (item, column) => {
    if (column.id === 'article') {
      return (
        <ArticleCell
          item={item}
          onCategoryFilter={onCategoryFilter}
          onPatternFilter={onPatternFilter}
          canSelect={canSelect}
          isSelected={Boolean(selectedIds && selectedIds.has(item.id))}
          onToggleSelect={onToggleSelect}
        />
      );
    }
    if (column.id === 'rkInfo') {
      return (
        <RkInfoCell
          item={item}
          onBidTypeFilter={onBidTypeFilter}
          compact={compactRkInfo}
        />
      );
    }
    if (column.id === 'fixation') {
      return <FixationCell item={item} />;
    }
    if (column.id === 'status') {
      return <StatusCell item={item} />;
    }
    if (column.id === 'bids') {
      return <BidCell item={item} />;
    }
    if (column.id === 'budget') {
      return <BudgetCell item={item} />;
    }
    if (column.id === 'activeHours') {
      return <ActiveHoursCell item={item} />;
    }
    if (column.id === 'turnover') {
      return <TurnoverCell item={item} />;
    }
    if (column.id === 'thresholds') {
      return <ThresholdsCell item={item} />;
    }
    if (column.id === 'clusterMetrics') {
      return <ClusterMetricsCell item={item} />;
    }
    // Линейные графики процентных метрик (CTR, CR): доля ×100, 2 знака + %.
    if (LINE_CHART_FIELDS[column.id]) {
      const [dataField, sumField] = LINE_CHART_FIELDS[column.id];
      const sumValue = item[sumField];
      return (
        <LazyChart height={60}>
          <LineChart
            data={item[dataField] || {}}
            summary={
              sumValue === null || sumValue === undefined
                ? '—'
                : `${Number(sumValue).toFixed(2)} %`
            }
            color={CHART_COLOR}
            height={60}
          />
        </LazyChart>
      );
    }
    if (column.id === 'actions') {
      const status = Number(item.status);
      return (
        <ActionsCell
          canManage={canManage}
          onPause={
            canManage && onPause && PAUSABLE_STATUSES.has(status)
              ? () => onPause(item)
              : null
          }
          onResume={
            canManage && onResume && RESUMABLE_STATUSES.has(status)
              ? () => onResume(item)
              : null
          }
          onFinish={
            canManage && onFinish && FINISHABLE_STATUSES.has(status)
              ? () => onFinish(item)
              : null
          }
          onDelete={
            canManage && onDelete && status !== DELETED_STATUS
              ? () => onDelete(item)
              : null
          }
          onSettings={
            canManage &&
            onSettings &&
            !SETTINGS_BLOCKED_STATUSES.has(status)
              ? () => onSettings(item)
              : null
          }
          onOpen={onOpen ? () => onOpen(item) : null}
        />
      );
    }
    const daily = item[column.key] || {};
    const summaryValue = item[SUMMARY_FIELDS[column.id]];
    return (
      <LazyChart height={60}>
        <BarChart
          data={daily}
          summary={
            summaryValue === null || summaryValue === undefined
              ? formatNumber(sumDaily(daily))
              : formatNumber(summaryValue)
          }
          color={CHART_COLOR}
          height={60}
        />
      </LazyChart>
    );
  };

  const renderHeaderCells = () =>
    columns.map((column) => {
      const isArticle = column.id === 'article';
      const isActions = column.id === FIXED_RIGHT_COLUMN_ID;
      const fixedClass = isArticle
        ? styles.fixedCol
        : isActions
          ? styles.fixedRightCol
          : '';
      const movable = !stretch && !isArticle && !isActions;
      const sizeStyle = stretch ? stretchStyle(column.id) : { width: column.width };
      return (
        <div
          key={column.id}
          className={`${styles.headerCell} ${fixedClass} ${stretch ? styles.stretchCell : ''} ${dragOverCol === column.id ? styles.dragOver : ''}`}
          style={sizeStyle}
          onDragOver={(e) => handleDragOver(e, column.id)}
          onDrop={(e) => handleDrop(e, column.id)}
        >
          {movable && (
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
          {isArticle && canSelect ? (
            <span className={styles.headerSelectBtns}>
              <button
                type="button"
                className={styles.headerSelectBtn}
                title="Снять выделение с видимых кампаний"
                aria-label="Снять выделение с видимых кампаний"
                onClick={() => onClearSelection && onClearSelection()}
              >
                <PiEmptyDuotone />
              </button>
              <button
                type="button"
                className={styles.headerSelectBtn}
                title="Выделить все видимые кампании"
                aria-label="Выделить все видимые кампании"
                onClick={() => onSelectAll && onSelectAll()}
              >
                <VscCircleLargeFilled />
              </button>
              {onImportIds && (
                <>
                  <button
                    type="button"
                    className={styles.headerSelectBtn}
                    title="Выбрать кампании из Excel"
                    aria-label="Выбрать кампании из Excel"
                    onClick={() => excelInputRef.current?.click()}
                  >
                    <FaFileExcel />
                  </button>
                  <input
                    ref={excelInputRef}
                    className={styles.hiddenFileInput}
                    type="file"
                    accept=".xlsx,.xls,.csv"
                    onChange={handleImportIds}
                  />
                </>
              )}
            </span>
          ) : null}
          {movable && (
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

  const renderBodyCells = (item) =>
    columns.map((column) => {
      const isArticle = column.id === 'article';
      const isActions = column.id === FIXED_RIGHT_COLUMN_ID;
      const fixedClass = isArticle
        ? styles.fixedCol
        : isActions
          ? styles.fixedRightCol
          : '';
      const sizeStyle = stretch ? stretchStyle(column.id) : { width: column.width };
      return (
        <div
          key={column.id}
          className={`${styles.cell} ${fixedClass} ${stretch ? styles.stretchCell : ''} ${CHART_COLUMN_IDS.includes(column.id) ? styles.chartCell : ''} ${CENTERED_COLUMN_IDS.includes(column.id) ? styles.centerCell : ''}`}
          style={sizeStyle}
        >
          {renderCell(item, column)}
        </div>
      );
    });

  const renderSkeletonRows = () =>
    Array.from({ length: SKELETON_ROWS }, (_, i) => (
      <div key={`skeleton-${i}`} className={styles.row}>
        {columns.map((column) => {
          const isArticle = column.id === 'article';
          const isActions = column.id === FIXED_RIGHT_COLUMN_ID;
          const fixedClass = isArticle
            ? styles.fixedCol
            : isActions
              ? styles.fixedRightCol
              : '';
          const sizeStyle = stretch
            ? stretchStyle(column.id)
            : { width: column.width };
          return (
            <div
              key={column.id}
              className={`${styles.cell} ${fixedClass} ${stretch ? styles.stretchCell : ''}`}
              style={sizeStyle}
            >
              <div className={styles.skeletonBlock} />
            </div>
          );
        })}
      </div>
    ));

  return (
    <>
      <div className={styles.table} ref={tableRef} data-istablescroll>
        <div className={`${styles.tableContent} ${stretch ? styles.tableContentStretch : ''}`}>
          {/* Шапка: закрепляется сверху внутри скролл-контейнера. */}
          <div className={styles.headerRow}>{renderHeaderCells()}</div>

          {/* Тело: строки или скелетон на время загрузки. */}
          <div className={styles.body}>
            {isLoading
              ? renderSkeletonRows()
              : pageItems.map((item, index) => (
                  <div key={item.id ?? index} className={styles.row}>
                    {renderBodyCells(item)}
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

export default PromoTable;
