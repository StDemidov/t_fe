import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { DateRangePicker, LineChart, MultiLineChart, StackedBarChart, StackedBarChartComparison, StepLineChart, AbcHeatmap, SeasonalChart } from '../../shared/ui';
import TagsCell from '../../widgets/skus-table/TagsCell';
import SelfPriceCell from '../../widgets/skus-table/SelfPriceCell';
import { MdOutlineKeyboardArrowUp, MdKeyboardArrowDown, MdCurrencyRuble } from 'react-icons/md';
import wbLogo from '../../shared/assets/wb_logo.png';
import {
  fetchSkuDetail,
  fetchCardMetrics,
  getDefaultSkuDetailRange,
  selectSkuDetailBySku,
} from '../../entities/sku-detail';
import { fetchTags, selectTagsMain, selectTagsCloth, selectTagsOthers } from '../../entities/tags';
import '../../app/styles/global.css';
import styles from './SkuDetailPage.module.css';

/** Человеко-читаемое название поля базовой информации по ключу (нижний регистр). */
const FIELD_LABELS = {
  vendorcode: 'Артикул',
  sku: 'SKU',
  brand: 'Бренд',
  category: 'Категория',
  pattern: 'Лекало',
  style: 'Стиль',
  creationdate: 'Дата обнаружения',
  startofrealization: 'Старт продаж',
  startofrealizationdate: 'Старт продаж',
  startofrealizaitiondate: 'Старт продаж',
  trahedonwbdate: 'Дата удаления',
  trashedonwbdate: 'Дата удаления',
  countryoforigin: 'Страна',
  name: 'Название',
  description: 'Описание',
  color: 'Цвет',
  size: 'Размер',
  composition: 'Состав',
};

/** Поля, которые выводятся плашками (в нужном порядке: категория, лекало, стиль). */
const BADGE_FIELDS = ['category', 'pattern', 'style'];

const normKey = (key) => String(key).toLowerCase();

/** Даты YYYY-mm-dd приводим к виду dd-mm-YYYY. */
const formatDateValue = (value) => {
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
    const [y, m, d] = value.split('-');
    return `${d}-${m}-${y}`;
  }
  return value;
};

/** Значение поля для отображения — примитивы как есть, объекты в JSON. */
const formatValue = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  if (typeof value === 'object') return JSON.stringify(value);
  return String(formatDateValue(value));
};

/** Форматирование числа (ru-RU, до 2 знаков). */
const fmtNum = (v) =>
  v === null || v === undefined || !Number.isFinite(Number(v))
    ? '—'
    : new Intl.NumberFormat('ru-RU', {
        maximumFractionDigits: 2,
      }).format(Number(v));

/** Последнее не null/не пустое значение из объекта { дата: значение }. */
const lastNonNull = (daily) => {
  if (!daily) return null;
  const dates = Object.keys(daily).sort();
  for (let i = dates.length - 1; i >= 0; i--) {
    const raw = daily[dates[i]];
    if (raw === null || raw === undefined || raw === '') continue;
    return Number(raw);
  }
  return null;
};

/** Отношение двух датасетов по датам в процентах (num / den * 100). */
const ratioSeries = (num, den) => {
  const out = {};
  for (const date of new Set([
    ...Object.keys(num || {}),
    ...Object.keys(den || {}),
  ])) {
    const denominator = Number(den[date]) || 0;
    out[date] = denominator !== 0 ? ((Number(num[date]) || 0) / denominator) * 100 : null;
  }
  return out;
};

/** Отношение двух сумм в процентах; null при нулевом знаменателе. */
const ratioPct = (num, den) => {
  const denominator = Number(den) || 0;
  return denominator !== 0 ? ((Number(num) || 0) / denominator) * 100 : null;
};

/** Возвращает класс цвета плашки ABC по значению (A/B/C/AAA/NEW и др.). */
const abcClass = (value) => {
  const key = String(value || '').toLowerCase();
  if (styles[`abc_${key}`]) return styles[`abc_${key}`];
  return styles.abcNeutral;
};

/** Изменение в процентах к прошлому периоду; null, если прошлое значение 0/нет. */
const pctChange = (current, previous) => {
  const cur = Number(current) || 0;
  const prev = Number(previous) || 0;
  if (prev === 0) return null;
  return ((cur - prev) / prev) * 100;
};

/**
 * Значение мини-блока + изменение к прошлому периоду (в процентах): рост —
 * зелёным со стрелкой вверх, падение — оранжевым со стрелкой вниз.
 */
const ChangeValue = ({ value, previous }) => {
  const pct = pctChange(value, previous);
  return (
    <div className={styles.miniGroup}>
      <span className={styles.miniValue}>
        {Number(value) !== 0 ? fmtNum(value) : '—'}
      </span>
      {pct !== null && (
        <span className={pct >= 0 ? styles.changeUp : styles.changeDown}>
          {pct >= 0 ? <MdOutlineKeyboardArrowUp /> : <MdKeyboardArrowDown />}
          {fmtNum(Math.abs(pct))}%
        </span>
      )}
    </div>
  );
};

/**
 * Ячейка себестоимости по аналогии с таблицей Товаров:
 * по умолчанию — без НДС, при наведении плавно пересчитывается к с НДС.
 */
const SelfPriceCellInline = ({ withNds, withoutNds }) => {
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
      className={styles.selfPriceInner}
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
 * Плашка баркода в таблице размеров: по клику копирует номер в буфер
 * и на секунду меняет текст на «Скопировано» (слайд вверх). Состояние
 * живёт внутри плашки — сброс не зависит от перерисовок страницы.
 */
const BarcodeChip = ({ barcode }) => {
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!copied) return;
    const timer = setTimeout(() => setCopied(false), 1000);
    return () => clearTimeout(timer);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(String(barcode));
    } catch {
      return;
    }
    setCopied(true);
  };

  return (
    <span
      className={styles.barcodeChip}
      onClick={handleCopy}
      title="Скопировать баркод"
    >
      <span className={styles.badgeSlideWrap}>
        <span
          className={`${styles.badgeSlide} ${
            copied ? styles.badgeSlideCopied : ''
          }`}
        >
          <span className={styles.badgeSlideItem}>{barcode}</span>
          <span className={styles.badgeSlideItem}>Скопировано</span>
        </span>
      </span>
    </span>
  );
};

/**
 * Страница товара по SKU (/skus/:sku).
 *
 * Вверху — липкая белая полоска с календарём: при прокрутке она остаётся
 * на месте, чтобы в любой момент сменить диапазон дат. Даты сравнения
 * считаются автоматически и не показываются.
 *
 * Под календарём — фото товара со ссылкой на Wildberries в правом верхнем углу.
 * Ниже отдельный блок с базовой информацией из skuBaseInfo: плашки
 * стиль/категория/лекало, артикул (по клику копируется), плашка SKU
 * (копируется со слайд-анимацией) и остальные поля списком.
 */
const SkuDetailPage = () => {
  const { sku } = useParams();
  const dispatch = useDispatch();
  const entry = useSelector(selectSkuDetailBySku(sku));
  const { data, isLoading, error } = entry || {};
  const tagsMain = useSelector(selectTagsMain);
  const tagsCloth = useSelector(selectTagsCloth);
  const tagsOthers = useSelector(selectTagsOthers);

  const defaultRange = getDefaultSkuDetailRange();
  const [range, setRange] = useState(() => ({
    startDate: defaultRange.startDate,
    endDate: defaultRange.endDate,
  }));

  const storedRange = entry?.range;
  useEffect(() => {
    if (storedRange?.startDate && storedRange?.endDate) {
      setRange({
        startDate: storedRange.startDate,
        endDate: storedRange.endDate,
      });
    }
  }, [storedRange?.startDate, storedRange?.endDate]);

  useEffect(() => {
    if (sku) dispatch(fetchSkuDetail({ sku }));
  }, [dispatch, sku]);

  // Метрики карточки подтягиваются отдельным запросом при открытии страницы.
  useEffect(() => {
    if (sku) dispatch(fetchCardMetrics({ sku }));
  }, [dispatch, sku]);

  // Если пулы тегов в редуксе пусты — подтягиваем get_all_tags.
  const tagsFetchedRef = useRef(false);
  useEffect(() => {
    if (
      !tagsFetchedRef.current &&
      (tagsMain.length === 0 || tagsCloth.length === 0 || tagsOthers.length === 0)
    ) {
      tagsFetchedRef.current = true;
      dispatch(fetchTags());
    }
  }, [dispatch, tagsMain.length, tagsCloth.length, tagsOthers.length]);

  const handleRangeChange = (nextRange) => {
    setRange(nextRange);
    if (sku) dispatch(fetchSkuDetail({ sku, range: nextRange }));
  };

  // Мини-инфо в тулбаре (фото + артикул + SKU) появляется только тогда,
  // когда базовый блок с информацией о товаре ушёл из виду при прокрутке.
  const baseInfoRef = useRef(null);
  const [toolbarProductVisible, setToolbarProductVisible] = useState(false);
  const [toolbarProductMounted, setToolbarProductMounted] = useState(false);
  const [toolbarProductShown, setToolbarProductShown] = useState(false);
  const toolbarHideTimerRef = useRef(null);

  // Плавное появление/исчезновение: блок держится в разметке до конца
  // fade-анимации (300 мс), после чего размонтируется.
  useEffect(() => {
    if (toolbarProductVisible) {
      clearTimeout(toolbarHideTimerRef.current);
      setToolbarProductMounted(true);
      requestAnimationFrame(() => setToolbarProductShown(true));
    } else {
      setToolbarProductShown(false);
      clearTimeout(toolbarHideTimerRef.current);
      toolbarHideTimerRef.current = setTimeout(
        () => setToolbarProductMounted(false),
        300
      );
    }
    return () => clearTimeout(toolbarHideTimerRef.current);
  }, [toolbarProductVisible]);

  useEffect(() => {
    const check = () => {
      const el = baseInfoRef.current;
      if (!el) {
        setToolbarProductVisible(false);
        return;
      }
      const rect = el.getBoundingClientRect();
      setToolbarProductVisible(rect.bottom < 0 || rect.top < 0);
    };
    check();
    window.addEventListener('scroll', check, { passive: true });
    window.addEventListener('resize', check);
    return () => {
      window.removeEventListener('scroll', check);
      window.removeEventListener('resize', check);
    };
  }, [data]);

  const baseInfo = data?.skuBaseInfo || {};

  // Все поля из skuBaseInfo; image уходит на фото и из списка исключается.
  const entries = Object.entries(baseInfo).filter(
    ([key]) => normKey(key) !== 'image'
  );

  const fieldValue = (name) =>
    entries.find(([key]) => normKey(key) === name)?.[1];

  const image = baseInfo.image || data?.image;
  const skuId = String(fieldValue('sku') ?? data?.sku ?? sku);
  const vendorCode = fieldValue('vendorcode');

  // Дата старта продаж (YYYY-mm-dd) из базовой информации — минимальная
  // дата, доступная в календаре.
  const realizationStartRaw = String(
    fieldValue('startofrealizationdate') ??
      fieldValue('startofrealizaitiondate') ??
      ''
  );
  const minCalendarDate = /^\d{4}-\d{2}-\d{2}$/.test(realizationStartRaw)
    ? realizationStartRaw
    : '2024-07-01';

  // Строки полей (без плашек и артикула/SKU), разбитые вокруг «Страны» —
  // строки тегов вставляются сразу после неё.
  const otherEntries = entries
    .filter(([key]) => !BADGE_FIELDS.includes(normKey(key)))
    .filter(([key]) => !['vendorcode', 'sku'].includes(normKey(key)));
  const countryIdx = otherEntries.findIndex(
    ([key]) => normKey(key) === 'countryoforigin'
  );
  const fieldsBeforeCountry =
    countryIdx >= 0 ? otherEntries.slice(0, countryIdx + 1) : otherEntries;
  const fieldsAfterCountry =
    countryIdx >= 0 ? otherEntries.slice(countryIdx + 1) : [];

  // Теги лежат в skuMetrics (с фолбэком на верхний уровень данных).
  const skuMetrics = data?.skuMetrics || {};
  const tagGroups = [
    { label: 'Теги (основные)', type: 'main', tags: skuMetrics.mainTags || data?.mainTags || [] },
    { label: 'Теги (ткань)', type: 'cloth', tags: skuMetrics.clothTags || data?.clothTags || [] },
    { label: 'Теги (доп.)', type: 'others', tags: skuMetrics.otherTags || data?.otherTags || [] },
  ];

  // Значения ABC для плашек на фото (бренд/категория).
  const abcAllCurrent = skuMetrics.abcAmongAllCurrent ?? data?.abcAmongAllCurrent;
  const abcCategoryCurrent =
    skuMetrics.abcAmongCategoryCurrent ?? data?.abcAmongCategoryCurrent;

  // Ежедневные ряды ABC { дата: значение } для тепловой карты.
  const abcAllDaily = skuMetrics.abcAmongAll ?? data?.abcAmongAll;
  const abcCategoryDaily = skuMetrics.abcAmongCategory ?? data?.abcAmongCategory;

  // Показатели для правых мини-блоков (из skuMetrics, с фолбэком на верхний уровень).
  const selfpriceWithNds =
    Number(skuMetrics.selfpriceWithNds ?? data?.selfpriceWithNds) || 0;
  const selfpriceWithoutNds =
    Number(
      skuMetrics.selfpriceWithoutNds ??
        skuMetrics.selfpriceWithouthNds ??
        data?.selfpriceWithoutNds
    ) || 0;
  const turnoverTotal =
    Number(skuMetrics.turnoverTotal ?? data?.turnoverTotal) || 0;
  const buyoutPercentMedian =
    Number(
      skuMetrics.buyoutPercentMedian ??
        skuMetrics.medianBuyoutPercent ??
        data?.buyoutPercentMedian
    ) || 0;
  const ebitdaAvg =
    Number(
      skuMetrics.ebitdaAvg ??
        skuMetrics.ebitaAvg ??
        skuMetrics.avgEbitda ??
        data?.ebitdaAvg
    ) || 0;
  const turnoverByBuyout =
    buyoutPercentMedian !== 0 ? turnoverTotal / 100 / buyoutPercentMedian : null;

  // Остатки (из skuMetrics, с фолбэком на верхний уровень).
  const stocksFbwCurrent =
    Number(skuMetrics.stocksFbwCurrent ?? data?.stocksFbwCurrent) || 0;
  const stocksFbsCurrent =
    Number(skuMetrics.stocksFbsCurrent ?? data?.stocksFbsCurrent) || 0;
  const quantityOnWayToClientCurrent =
    Number(
      skuMetrics.quantityOnWayToClientCurrent ??
        data?.quantityOnWayToClientCurrent
    ) || 0;
  const quantityOnWayToWarehouseCurrent =
    Number(
      skuMetrics.quantityOnWayToWarehouseCurrent ??
        data?.quantityOnWayToWarehouseCurrent
    ) || 0;
  const stocksOnWay =
    quantityOnWayToClientCurrent + quantityOnWayToWarehouseCurrent;

  // Суммовые показатели (текущий и прошлый период) для мини-блоков.
  const ebitdaSumTotal =
    Number(skuMetrics.totalEbitdaFbwTotalSum ?? data?.totalEbitdaFbwTotalSum) ||
    0;
  const ebitdaSumPrev =
    Number(
      skuMetrics.comparisonTotalEbitdaFbwTotalSum ??
        data?.comparisonTotalEbitdaFbwTotalSum
    ) || 0;
  const ordersSumTotal =
    Number(skuMetrics.ordersTotalSum ?? data?.ordersTotalSum) || 0;
  const ordersSumPrev =
    Number(
      skuMetrics.comparisonOrdersTotalSum ?? data?.comparisonOrdersTotalSum
    ) || 0;
  const salesSumTotal =
    Number(skuMetrics.salesTotalSum ?? data?.salesTotalSum) || 0;
  const salesSumPrev =
    Number(
      skuMetrics.comparisonSalesTotalSum ?? data?.comparisonSalesTotalSum
    ) || 0;
  const adsCostsSumTotal =
    Number(skuMetrics.adsCostsSum ?? data?.adsCostsSum) || 0;
  const adsCostsSumPrev =
    Number(
      skuMetrics.comparisonAdsCostsSum ?? data?.comparisonAdsCostsSum
    ) || 0;

  // Датасеты графика «Заказы»: по датам и суммы/сравнение для каждого из FBW/FBS.
  const ordersChartDatasets = [
    {
      name: 'FBW',
      color: '#7c5ce8',
      negativeColor: '#ff4d4d',
      summary: Number(skuMetrics.ordersFbwSum ?? data?.ordersFbwSum) || 0,
      comparisonSummary:
        Number(
          skuMetrics.comparisonOrdersFbwSum ?? data?.comparisonOrdersFbwSum
        ) || 0,
      data: skuMetrics.ordersFbw || {},
    },
    {
      name: 'FBS',
      color: '#00bfa6',
      negativeColor: '#ff8c00',
      summary: Number(skuMetrics.ordersFbsSum ?? data?.ordersFbsSum) || 0,
      comparisonSummary:
        Number(
          skuMetrics.comparisonOrdersFbsSum ?? data?.comparisonOrdersFbsSum
        ) || 0,
      data: skuMetrics.ordersFbs || {},
    },
  ];

  // Датасеты графика «Продажи».
  const salesChartDatasets = [
    {
      name: 'FBW',
      color: '#7c5ce8',
      negativeColor: '#ff4d4d',
      summary: Number(skuMetrics.salesFbwSum ?? data?.salesFbwSum) || 0,
      comparisonSummary:
        Number(
          skuMetrics.comparisonSalesFbwSum ?? data?.comparisonSalesFbwSum
        ) || 0,
      data: skuMetrics.salesFbw || {},
    },
    {
      name: 'FBS',
      color: '#00bfa6',
      negativeColor: '#ff8c00',
      summary: Number(skuMetrics.salesFbsSum ?? data?.salesFbsSum) || 0,
      comparisonSummary:
        Number(
          skuMetrics.comparisonSalesFbsSum ?? data?.comparisonSalesFbsSum
        ) || 0,
      data: skuMetrics.salesFbs || {},
    },
  ];

  // Датасеты графика «Суммарная EBITDA».
  const ebitdaChartDatasets = [
    {
      name: 'FBW',
      color: '#7c5ce8',
      negativeColor: '#ff4d4d',
      summary:
        Number(skuMetrics.totalEbitdaFbwSum ?? data?.totalEbitdaFbwSum) || 0,
      comparisonSummary:
        Number(
          skuMetrics.comparisonTotalEbitdaFbwSum ??
            data?.comparisonTotalEbitdaFbwSum
        ) || 0,
      data: skuMetrics.totalEbitdaFbw || {},
    },
    {
      name: 'FBS',
      color: '#00bfa6',
      negativeColor: '#ff8c00',
      summary:
        Number(skuMetrics.totalEbitdaFbsSum ?? data?.totalEbitdaFbsSum) || 0,
      comparisonSummary:
        Number(
          skuMetrics.comparisonTotalEbitdaFbsSum ??
            data?.comparisonTotalEbitdaFbsSum
        ) || 0,
      data: skuMetrics.totalEbitdaFbs || {},
    },
  ];

  // Цена до СПП: последнее не null значение из датасета price, без сравнения.
  const priceLast = lastNonNull(skuMetrics.price ?? data?.price);

  // Датасеты графика «Остатки»: суммы — последние не null значения.
  const stocksChartDatasets = [
    {
      name: 'FBW',
      color: '#7c5ce8',
      negativeColor: '#ff4d4d',
      summary: lastNonNull(skuMetrics.stocksFbw ?? data?.stocksFbw),
      data: skuMetrics.stocksFbw || {},
    },
    {
      name: 'FBS',
      color: '#00bfa6',
      negativeColor: '#ff8c00',
      summary: lastNonNull(skuMetrics.stocksFbs ?? data?.stocksFbs),
      data: skuMetrics.stocksFbs || {},
    },
  ];

  // Суммарная EBITDA (без РК): один датасет со сравнением.
  const ebitdaNoAdsChartDatasets = [
    {
      name: 'Без РК',
      color: '#623fc0',
      negativeColor: '#ff4d4d',
      summary:
        Number(
          skuMetrics.totalEbitdaTotalWithoutAdsSum ??
            data?.totalEbitdaTotalWithoutAdsSum
        ) || 0,
      comparisonSummary:
        Number(
          skuMetrics.comparisonTotalEbitdaTotalWithoutAdsSum ??
            data?.comparisonTotalEbitdaTotalWithoutAdsSum ??
            data?.comparisonTotalEbitdaTotalWithoutAds
        ) || 0,
      data: skuMetrics.totalEbitdaTotalWithoutAds || {},
    },
  ];

  // EBITDA: один датасет со сравнением (аналогично «Суммарная EBITDA (без РК)»).
  const ebitdaChartDataset = [
    {
      name: 'EBITDA',
      color: '#623fc0',
      negativeColor: '#ff4d4d',
      summary: Number(skuMetrics.ebitaAvg ?? data?.ebitaAvg) || 0,
      comparisonSummary:
        Number(
          skuMetrics.comparisonEbitdaAvg ?? data?.comparisonEbitdaAvg
        ) || 0,
      data: skuMetrics.ebitda || {},
    },
  ];

  // Процент выкупа: медиана и сравнение в процентных пунктах + линия бенчмарка.
  const buyoutMedian =
    Number(skuMetrics.buyoutPercentMedian ?? data?.buyoutPercentMedian) || 0;
  const buyoutMedianComparison =
    Number(
      skuMetrics.comparisonBuyoutPercentMedian ??
        data?.comparisonBuyoutPercentMedian
    ) || 0;
  const buyoutChange = buyoutMedian - buyoutMedianComparison;
  const buyoutBenchmark =
    Number(
      skuMetrics.categoryBuyoutPercentMedian ??
        data?.categoryBuyoutPercentMedian
    ) || 0;

  // Рекламные расходы: один датасет со сравнением (аналогично EBITDA без РК).
  const adsCostsChartDataset = [
    {
      name: 'РК',
      color: '#623fc0',
      negativeColor: '#ff4d4d',
      summary: Number(skuMetrics.adsCostsSum ?? data?.adsCostsSum) || 0,
      comparisonSummary:
        Number(
          skuMetrics.comparisonAdsCostsSum ?? data?.comparisonAdsCostsSum
        ) || 0,
      data: skuMetrics.adsCosts || {},
    },
  ];

  // Конверсии (в процентах): три линии с саммари и сравнением в п.п.
  const addingsToCart = skuMetrics.addingsToCart || {};
  const clicks = skuMetrics.clicks || {};
  const ordersTotal = skuMetrics.orderTotal || skuMetrics.ordersTotal || {};
  const addingsToCartSum =
    Number(skuMetrics.addingsToCartSum ?? data?.addingsToCartSum) || 0;
  const clicksSum = Number(skuMetrics.clicksSum ?? data?.clicksSum) || 0;
  const ordersTotalSum =
    Number(skuMetrics.ordersTotalSum ?? data?.ordersTotalSum) || 0;
  const comparisons = {
    addingsToCart:
      Number(
        skuMetrics.comparisonAddingsToCartSum ??
          data?.comparisonAddingsToCartSum
      ) || 0,
    clicks: Number(skuMetrics.comparisonClicksSum ?? data?.comparisonClicksSum) || 0,
    ordersTotal:
      Number(
        skuMetrics.comparisonOrdersTotalSum ?? data?.comparisonOrdersTotalSum
      ) || 0,
  };

  const conversionDatasets = [
    {
      name: 'CR клик -> корзина',
      color: '#7c5ce8',
      summary: ratioPct(addingsToCartSum, clicksSum),
      comparisonSummary: ratioPct(
        comparisons.addingsToCart,
        comparisons.clicks
      ),
      data: ratioSeries(addingsToCart, clicks),
    },
    {
      name: 'CR корзина -> заказ',
      color: '#00bfa6',
      summary: ratioPct(ordersTotalSum, addingsToCartSum),
      comparisonSummary: ratioPct(
        comparisons.ordersTotal,
        comparisons.addingsToCart
      ),
      data: ratioSeries(ordersTotal, addingsToCart),
    },
    {
      name: 'CR клик -> заказ',
      color: '#f5a623',
      summary: ratioPct(ordersTotalSum, clicksSum),
      comparisonSummary: ratioPct(
        comparisons.ordersTotal,
        comparisons.clicks
      ),
      data: ratioSeries(ordersTotal, clicks),
    },
  ];

  // CPO: один датасет со сравнением (аналогично EBITDA).
  const cpoChartDataset = [
    {
      name: 'CPO',
      color: '#623fc0',
      negativeColor: '#ff4d4d',
      summary: Number(skuMetrics.cpoAvg ?? data?.cpoAvg) || 0,
      comparisonSummary:
        Number(skuMetrics.comparisonCpoAvg ?? data?.comparisonCpoAvg) || 0,
      data: skuMetrics.cpo || {},
    },
  ];

  // CPS: один датасет со сравнением (аналогично EBITDA).
  const cpsChartDataset = [
    {
      name: 'CPS',
      color: '#623fc0',
      negativeColor: '#ff4d4d',
      summary: Number(skuMetrics.cpsAvg ?? data?.cpsAvg) || 0,
      comparisonSummary:
        Number(skuMetrics.comparisonCpsAvg ?? data?.comparisonCpsAvg) || 0,
      data: skuMetrics.cps || {},
    },
  ];

  // Девять мини-блоков сетки 3×3.
  const miniBlocks = [
    {
      key: 'selfprice',
      title: 'Себестоимость',
      content: (
        <SelfPriceCell item={{ selfpriceWithNds, selfpriceWithoutNds }} />
      ),
    },
    {
      key: 'turnover',
      title: 'Оборачиваемость',
      content: (
        <div className={styles.turnLines}>
          <span className={styles.turnLine}>
            <span className={styles.turnLabel}>По заказам</span>
            <b
              className={`${styles.turnValue} ${
                Number(turnoverTotal) === 0 ? styles.turnoverZero : ''
              }`}
            >
              {fmtNum(turnoverTotal)}
            </b>
          </span>
          <span className={styles.turnLine}>
            <span className={styles.turnLabel}>По выкупам</span>
            <b
              className={`${styles.turnValue} ${
                turnoverByBuyout !== null &&
                Number(turnoverByBuyout) === 0
                  ? styles.turnoverZero
                  : ''
              }`}
            >
              {fmtNum(turnoverByBuyout)}
            </b>
          </span>
        </div>
      ),
    },
    {
      key: 'buyout',
      title: '% Выкупа',
      content: (
        <span className={styles.miniValue}>
          {buyoutPercentMedian !== 0 ? `${fmtNum(buyoutPercentMedian)}%` : '—'}
        </span>
      ),
    },
    {
      key: 'ebitda',
      title: 'EBITDA',
      content: (
        <span className={styles.miniValue}>
          {ebitdaAvg !== 0 ? fmtNum(ebitdaAvg) : '—'}
        </span>
      ),
    },
    {
      key: 'stocks',
      title: 'Остатки',
      content: (
        <div className={`${styles.turnLines} ${styles.stocksLines}`}>
          <span className={styles.turnLine}>
            <span className={styles.turnLabel}>Остатки FBW</span>
            <b className={styles.turnValue}>{fmtNum(stocksFbwCurrent)}</b>
          </span>
          <span className={styles.turnLine}>
            <span className={styles.turnLabel}>Остатки FBS</span>
            <b className={styles.turnValue}>{fmtNum(stocksFbsCurrent)}</b>
          </span>
          <span className={styles.turnLine}>
            <span className={styles.turnLabel}>В пути</span>
            <b className={styles.turnValue}>{fmtNum(stocksOnWay)}</b>
          </span>
        </div>
      ),
    },
    {
      key: 'ebitdaSum',
      title: 'EBITDA сумм.',
      content: <ChangeValue value={ebitdaSumTotal} previous={ebitdaSumPrev} />,
    },
    {
      key: 'orders',
      title: 'Заказы',
      content: <ChangeValue value={ordersSumTotal} previous={ordersSumPrev} />,
    },
    {
      key: 'sales',
      title: 'Продажи',
      content: <ChangeValue value={salesSumTotal} previous={salesSumPrev} />,
    },
    {
      key: 'adsCosts',
      title: 'Затраты на РК',
      content: <ChangeValue value={adsCostsSumTotal} previous={adsCostsSumPrev} />,
    },
  ];

  // Копирование артикула с подсказкой у курсора.
  const [vendorCopied, setVendorCopied] = useState(false);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const vendorTimerRef = useRef(null);

  // Копирование SKU со слайд-анимацией внутри плашки.
  const [skuCopied, setSkuCopied] = useState(false);
  const skuTimerRef = useRef(null);

  useEffect(() => {
    return () => {
      clearTimeout(vendorTimerRef.current);
      clearTimeout(skuTimerRef.current);
    };
  }, []);

  const handleCopyVendor = async (e) => {
    try {
      await navigator.clipboard.writeText(String(vendorCode));
    } catch {
      return;
    }
    setTooltipPos({ top: e.clientY - 10, left: e.clientX + 10 });
    setVendorCopied(true);
    clearTimeout(vendorTimerRef.current);
    vendorTimerRef.current = setTimeout(() => setVendorCopied(false), 1000);
  };

  const handleCopySku = async () => {
    try {
      await navigator.clipboard.writeText(skuId);
    } catch {
      return;
    }
    setSkuCopied(true);
    clearTimeout(skuTimerRef.current);
    skuTimerRef.current = setTimeout(() => setSkuCopied(false), 1000);
  };

  // Список размеров с их метриками (из skuMetrics, с фолбэком на верхний уровень).
  const chrtIdsMetrics = data?.skuMetrics?.chrtIdsMetrics ?? data?.chrtIdsMetrics ?? [];

  // Сезонные коэффициенты по неделям года: бэкенд может отдавать их как
  // массив, строку через запятую или объект { неделя: значение }, а ключи —
  // в camelCase или snake_case. Приводим к массиву чисел.
  const seasonalToArray = (raw) => {
    if (Array.isArray(raw)) {
      return raw.map((v) => Number(v) || 0);
    }
    if (typeof raw === 'string') {
      return raw
        .split(',')
        .map((v) => (v.trim() === '' ? 0 : Number(v.trim()) || 0));
    }
    if (raw && typeof raw === 'object') {
      return Object.keys(raw)
        .sort((a, b) => Number(a) - Number(b))
        .map((k) => Number(raw[k]) || 0);
    }
    return [];
  };
  const categoryMetricsRaw =
    data?.categorySeasonalKoefs ??
    data?.category_seasonal_koefs ??
    data?.categoryMetrics ??
    data?.category_metrics ??
    data?.skuMetrics?.categorySeasonalKoefs ??
    data?.skuMetrics?.category_seasonal_koefs ??
    data?.skuMetrics?.categoryMetrics ??
    data?.skuMetrics?.category_metrics;
  const ordersSeasonalKoefs = seasonalToArray(
    categoryMetricsRaw?.ordersSeasonalKoefs ??
      categoryMetricsRaw?.orders_seasonal_koefs
  );
  const pricesSeasonalKoefs = seasonalToArray(
    categoryMetricsRaw?.pricesSeasonalKoefs ??
      categoryMetricsRaw?.avg_price_koefs ??
      categoryMetricsRaw?.prices_seasonal_koefs
  );

  const wbUrl = `https://www.wildberries.ru/catalog/${skuId}/detail.aspx`;

  return (
    <div className={`page ${styles.root}`}>
      <div className={styles.toolbar}>
        <DateRangePicker
          value={range}
          onChange={handleRangeChange}
          minDate={minCalendarDate}
          maxDate={defaultRange.endDate}
        />
        {toolbarProductMounted && (
          <div
            className={`${styles.toolbarProduct} ${
              toolbarProductShown ? styles.toolbarProductVisible : ''
            }`}
          >
            {image ? (
              <img
                className={styles.toolbarPhoto}
                src={image}
                alt={vendorCode || skuId}
              />
            ) : null}
            <span
              className={styles.toolbarVendor}
              onClick={handleCopyVendor}
              title="Скопировать артикул"
            >
              {vendorCode || '—'}
            </span>
            <span
              className={styles.skuBadge}
              onClick={handleCopySku}
              title="Скопировать SKU"
            >
              <span className={styles.badgeSlideWrap}>
                <span
                  className={`${styles.badgeSlide} ${skuCopied ? styles.badgeSlideCopied : ''}`}
                >
                  <span className={styles.badgeSlideItem}>{skuId}</span>
                  <span className={styles.badgeSlideItem}>Скопировано</span>
                </span>
              </span>
            </span>
          </div>
        )}
      </div>

      {isLoading && !data && (
        <div className={styles.detailSkeleton}>
          <div className={styles.skeletonContent}>
            <div className={`${styles.skeletonBlock} ${styles.skeletonPhoto}`} />
            <div className={`${styles.skeletonBlock} ${styles.skeletonInfo}`} />
            <div className={styles.skeletonGrid}>
              {Array.from({ length: 9 }, (_, i) => (
                <div
                  key={i}
                  className={`${styles.skeletonBlock} ${styles.skeletonMini}`}
                />
              ))}
            </div>
          </div>
          <div className={styles.skeletonCharts}>
            {Array.from({ length: 6 }, (_, i) => (
              <div
                key={i}
                className={`${styles.skeletonBlock} ${styles.skeletonChart}`}
              />
            ))}
          </div>
        </div>
      )}

      {data && (
        <div className={styles.content}>
          <div className={styles.imageWrap}>
            {image ? (
              <img
                className={styles.photo}
                src={image}
                alt={vendorCode || skuId}
              />
            ) : (
              <div className={styles.noImage}>?</div>
            )}
            <a
              className={styles.wbOverlay}
              href={wbUrl}
              target="_blank"
              rel="noopener noreferrer"
              title="Открыть на Wildberries"
            >
              <img className={styles.wbLogo} src={wbLogo} alt="WB" />
            </a>
            <div className={styles.abcOverlay}>
              <span
                className={`${styles.abcCard} ${
                  abcAllCurrent ? abcClass(abcAllCurrent) : styles.abcHidden
                }`}
              >
                <span className={styles.abcLabel}>Бренд</span>
                <b className={styles.abcValue}>
                  {abcAllCurrent || '—'}
                </b>
              </span>
              <span
                className={`${styles.abcCard} ${
                  abcCategoryCurrent
                    ? abcClass(abcCategoryCurrent)
                    : styles.abcHidden
                }`}
              >
                <span className={styles.abcLabel}>Категория</span>
                <b className={styles.abcValue}>
                  {abcCategoryCurrent || '—'}
                </b>
              </span>
            </div>
          </div>

          <div ref={baseInfoRef} className={`card ${styles.baseInfoCard}`}>
            <div className={styles.badges}>
              {entries
                .filter(([key]) => BADGE_FIELDS.includes(normKey(key)))
                .sort(
                  (a, b) =>
                    BADGE_FIELDS.indexOf(normKey(a[0])) -
                    BADGE_FIELDS.indexOf(normKey(b[0]))
                )
                .map(([key, value]) => (
                  <span
                    key={key}
                    className={[
                      styles.badge,
                      styles[
                        `badge${normKey(key)[0].toUpperCase()}${normKey(key).slice(1)}`
                      ],
                    ].join(' ')}
                  >
                    {formatValue(value)}
                  </span>
                ))}
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Артикул</span>
              <span
                className={styles.vendorCode}
                onClick={handleCopyVendor}
                title="Скопировать артикул"
              >
                {vendorCode || '—'}
              </span>
            </div>

            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>SKU</span>
              <span
                className={styles.skuBadge}
                onClick={handleCopySku}
                title="Скопировать SKU"
              >
                <span className={styles.badgeSlideWrap}>
                  <span
                    className={`${styles.badgeSlide} ${skuCopied ? styles.badgeSlideCopied : ''}`}
                  >
                    <span className={styles.badgeSlideItem}>{skuId}</span>
                    <span className={styles.badgeSlideItem}>Скопировано</span>
                  </span>
                </span>
              </span>
            </div>

            {fieldsBeforeCountry.map(([key, value]) => (
                <div key={key} className={styles.infoRow}>
                  <span className={styles.infoLabel}>
                    {FIELD_LABELS[normKey(key)] || key}
                  </span>
                  <span className={styles.fieldValue}>
                    {formatValue(value)}
                  </span>
                </div>
              ))}

            {tagGroups.map((group) => (
              <div key={group.type} className={styles.infoRow}>
                <span className={styles.infoLabel}>{group.label}</span>
                <div className={styles.tagsWrap}>
                  <TagsCell tags={group.tags} sku={sku} type={group.type} />
                </div>
              </div>
            ))}

            {fieldsAfterCountry.map(([key, value]) => (
              <div key={key} className={styles.infoRow}>
                <span className={styles.infoLabel}>
                  {FIELD_LABELS[normKey(key)] || key}
                </span>
                <span className={styles.fieldValue}>
                  {formatValue(value)}
                </span>
              </div>
            ))}
          </div>

          <div className={styles.sideGrid}>
            {miniBlocks.map((block) => (
              <div key={block.key} className={`card ${styles.miniCard}`}>
                <span className={styles.miniTitle}>{block.title}</span>
                {block.content}
              </div>
            ))}
            {/* Пустые ячейки: по 3 блока в каждой колонке, один столбец пуст. */}
            {Array.from({ length: 9 - miniBlocks.length }, (_, i) => (
              <div key={`empty-${i}`} className={`card ${styles.miniCard}`} />
            ))}
          </div>
        </div>
      )}

      {data && (
        <div className={styles.chartsRow}>
          <div className={`card ${styles.chartCard}`}>
            <span className={styles.miniTitle}>Заказы</span>
            <StackedBarChartComparison
              datasets={ordersChartDatasets}
              height={88}
            />
          </div>
          <div className={`card ${styles.chartCard}`}>
            <span className={styles.miniTitle}>Продажи</span>
            <StackedBarChartComparison
              datasets={salesChartDatasets}
              height={88}
            />
          </div>
          <div className={`card ${styles.chartCard}`}>
            <span className={styles.miniTitle}>Суммарная EBITDA</span>
            <StackedBarChartComparison
              datasets={ebitdaChartDatasets}
              height={88}
            />
          </div>

          <div className={`card ${styles.chartCard}`}>
            <span className={styles.miniTitle}>Цена до СПП</span>
            <StepLineChart
              data={skuMetrics.price || {}}
              summary={priceLast !== null ? fmtNum(priceLast) : '—'}
              height={88}
            />
          </div>
          <div className={`card ${styles.chartCard}`}>
            <span className={styles.miniTitle}>Остатки</span>
            <StackedBarChartComparison
              datasets={stocksChartDatasets}
              height={88}
              total={
                (Number(stocksChartDatasets[0].summary) || 0) +
                (Number(stocksChartDatasets[1].summary) || 0)
              }
            />
          </div>
          <div className={`card ${styles.chartCard}`}>
            <span className={styles.miniTitle}>Суммарная EBITDA (без РК)</span>
            <StackedBarChartComparison
              datasets={ebitdaNoAdsChartDatasets}
              height={88}
            />
          </div>
          <div className={`card ${styles.chartCard}`}>
            <span className={styles.miniTitle}>EBITDA</span>
            <StackedBarChartComparison
              datasets={ebitdaChartDataset}
              height={88}
            />
          </div>
          <div className={`card ${styles.chartCard}`}>
            <span className={styles.miniTitle}>Процент выкупа</span>
            <LineChart
              data={skuMetrics.buyoutPercent || {}}
              summary={buyoutMedian !== 0 ? `${fmtNum(buyoutMedian)}%` : '—'}
              benchmark={buyoutBenchmark}
              change={buyoutMedian !== 0 ? buyoutChange : null}
              changeSuffix="пп."
              height={88}
            />
          </div>
          <div className={`card ${styles.chartCard}`}>
            <span className={styles.miniTitle}>Рекламные расходы</span>
            <StackedBarChartComparison
              datasets={adsCostsChartDataset}
              height={88}
            />
          </div>

          <div className={`card ${styles.chartCard}`}>
            <span className={styles.miniTitle}>Конверсии</span>
            <MultiLineChart datasets={conversionDatasets} height={88} />
          </div>
          <div className={`card ${styles.chartCard}`}>
            <span className={styles.miniTitle}>CPO</span>
            <StackedBarChartComparison
              datasets={cpoChartDataset}
              height={88}
            />
          </div>
          <div className={`card ${styles.chartCard}`}>
            <span className={styles.miniTitle}>CPS</span>
            <StackedBarChartComparison
              datasets={cpsChartDataset}
              height={88}
            />
          </div>
        </div>
      )}

      {data && (
        <div className={styles.abcRow}>
          <div className={`card ${styles.abcChartCard}`}>
            <span className={styles.miniTitle}>ABC (бренд)</span>
            <AbcHeatmap data={abcAllDaily} />
          </div>
          <div className={`card ${styles.abcChartCard}`}>
            <span className={styles.miniTitle}>ABC (категория)</span>
            <AbcHeatmap data={abcCategoryDaily} />
          </div>
        </div>
      )}

      {chrtIdsMetrics.length > 0 && (
        <div className={`card ${styles.sizesCard}`}>
          <div className={styles.sizesScroll}>
          <table className={styles.sizesTable}>
            <thead>
              <tr>
                <th>Размер</th>
                <th>Баркоды</th>
                <th>Заказы</th>
                <th>Продажи</th>
                <th>Остатки</th>
                <th>Остатки последние</th>
                <th>EBITDA/день</th>
                <th>Себестоимость</th>
                <th>Обор-сть FBS</th>
                <th>Обор-сть FBW</th>
                <th>Обор-сть общая</th>
              </tr>
            </thead>
            <tbody>
              {chrtIdsMetrics.map((row, idx) => {
                const rowSalesDatasets = [
                  {
                    name: 'FBW',
                    color: '#7c5ce8',
                    negativeColor: '#ff4d4d',
                    summary: Number(row.salesFbwSum) || 0,
                    data: row.salesFbw || {},
                  },
                  {
                    name: 'FBS',
                    color: '#00bfa6',
                    negativeColor: '#ff8c00',
                    summary: Number(row.salesFbsSum) || 0,
                    data: row.salesFbs || {},
                  },
                ];
                const rowSalesTotal =
                  (Number(row.salesFbwSum) || 0) +
                  (Number(row.salesFbsSum) || 0);

                const rowOrdersDatasets = [
                  {
                    name: 'FBW',
                    color: '#7c5ce8',
                    negativeColor: '#ff4d4d',
                    summary: Number(row.ordersFbwSum) || 0,
                    data: row.ordersFbw || {},
                  },
                  {
                    name: 'FBS',
                    color: '#00bfa6',
                    negativeColor: '#ff8c00',
                    summary: Number(row.ordersFbsSum) || 0,
                    data: row.ordersFbs || {},
                  },
                ];
                const rowOrdersTotal =
                  (Number(row.ordersFbwSum) || 0) +
                  (Number(row.ordersFbsSum) || 0);

                const fbwLast = lastNonNull(row.stocksFbw);
                const fbsLast = lastNonNull(row.stocksFbs);
                const rowStocksDatasets = [
                  {
                    name: 'FBW',
                    color: '#7c5ce8',
                    negativeColor: '#ff4d4d',
                    summary: fbwLast || 0,
                    data: row.stocksFbw || {},
                  },
                  {
                    name: 'FBS',
                    color: '#00bfa6',
                    negativeColor: '#ff8c00',
                    summary: fbsLast || 0,
                    data: row.stocksFbs || {},
                  },
                ];
                const rowStocksTotal = (fbwLast || 0) + (fbsLast || 0);

                const rowEbitdaDatasets = [
                  {
                    name: 'FBW',
                    color: '#7c5ce8',
                    negativeColor: '#ff4d4d',
                    summary: Number(row.totalEbitdaFbwSum) || 0,
                    data: row.totalEbitdaFbw || {},
                  },
                  {
                    name: 'FBS',
                    color: '#00bfa6',
                    negativeColor: '#ff8c00',
                    summary: Number(row.totalEbitdaFbsSum) || 0,
                    data: row.totalEbitdaFbs || {},
                  },
                ];
                const rowEbitdaTotal =
                  (Number(row.totalEbitdaFbwSum) || 0) +
                  (Number(row.totalEbitdaFbsSum) || 0);

                const withNds = Number(row.averageSelfpriceWithNds) || 0;
                const withoutNds = Number(row.averageSelfpriceWithoutNds) || 0;

                // «Остатки последние»: текущие остатки с разбивкой FBW / FBS /
                // В пути / Всего, как в таблице Товаров.
                const stockLastFbw = Number(row.stocksFbwCurrent) || 0;
                const stockLastFbs = Number(row.stocksFbsCurrent) || 0;
                const stockLastWay =
                  (Number(row.quantityOnWayToClientCurrent) || 0) +
                  (Number(row.quantityOnWayToWarehouseCurrent) || 0);
                const stocksLastLines = [
                  { label: 'Остатки FBW', value: stockLastFbw },
                  { label: 'Остатки FBS', value: stockLastFbs },
                  { label: 'В пути', value: stockLastWay },
                  {
                    label: 'Всего',
                    value: stockLastFbw + stockLastFbs + stockLastWay,
                    strong: true,
                  },
                ];
                const fmtStock = (v) =>
                  new Intl.NumberFormat('ru-RU').format(Math.round(v));

                // Оборачиваемость по заказам / по выкупам для трёх колонок
                // (FBS, FBW, общая), по аналогии с таблицей Товаров. Поле может
                // прийти скаляром или словарём {дата: значение}.
                const turnoverValue = (raw) =>
                  raw && typeof raw === 'object' && !Array.isArray(raw)
                    ? lastNonNull(raw) || 0
                    : Number(raw) || 0;
                const byOrdersFbs = turnoverValue(row.turnoverFbs);
                const byOrdersFbw = turnoverValue(row.turnoverFbw);
                const byOrdersTotal = turnoverValue(row.turnoverTotal);
                const byBuyoutValue = (v) =>
                  buyoutPercentMedian !== 0
                    ? (v / buyoutPercentMedian) * 100
                    : null;
                const turnoverColumns = [
                  {
                    key: 'FBS',
                    byOrders: byOrdersFbs,
                    byBuyout: byBuyoutValue(byOrdersFbs),
                  },
                  {
                    key: 'FBW',
                    byOrders: byOrdersFbw,
                    byBuyout: byBuyoutValue(byOrdersFbw),
                  },
                  {
                    key: 'total',
                    byOrders: byOrdersTotal,
                    byBuyout: byBuyoutValue(byOrdersTotal),
                  },
                ];
                const fmtTurnover = (v) =>
                  v === null || v === undefined || !Number.isFinite(Number(v))
                    ? '—'
                    : new Intl.NumberFormat('ru-RU').format(Math.round(v));
                const renderTurnoverLines = (col) => (
                  <div className={styles.stocksLines}>
                    {[
                      { label: 'По заказам', value: col.byOrders },
                      { label: 'По выкупам', value: col.byBuyout },
                    ].map((line) => (
                      <span key={line.label} className={styles.stocksLine}>
                        <span className={styles.stocksLineLabel}>
                          {line.label}
                        </span>
                        <b
                          className={`${styles.stocksLineValue} ${
                            Number(line.value) === 0
                              ? styles.turnoverZero
                              : ''
                          }`}
                        >
                          {fmtTurnover(line.value)}
                        </b>
                      </span>
                    ))}
                  </div>
                );

                return (<tr key={idx}>
                  <td className={styles.sizeCell}>{row.size}</td>
                  <td className={styles.barcodeCell}>
                    <div className={styles.barcodeList}>
                      {(row.barcodesList || []).map((barcode) => (
                        <BarcodeChip key={barcode} barcode={barcode} />
                      ))}
                    </div>
                  </td>
                  <td className={styles.salesCell}>
                    <StackedBarChart
                      datasets={rowOrdersDatasets}
                      total={rowOrdersTotal}
                      height={60}
                    />
                  </td>
                  <td className={styles.salesCell}>
                    <StackedBarChart
                      datasets={rowSalesDatasets}
                      total={rowSalesTotal}
                      height={60}
                    />
                  </td>
                  <td className={styles.salesCell}>
                    <StackedBarChart
                      datasets={rowStocksDatasets}
                      total={rowStocksTotal}
                      height={60}
                    />
                  </td>
                  <td className={styles.salesCell}>
                    <div className={styles.stocksLines}>
                      {stocksLastLines.map((line) => (
                        <span
                          key={line.label}
                          className={`${styles.stocksLine} ${
                            line.strong ? styles.stocksLineStrong : ''
                          }`}
                        >
                          <span className={styles.stocksLineLabel}>
                            {line.label}
                          </span>
                          <b className={styles.stocksLineValue}>
                            {fmtStock(line.value)}
                          </b>
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className={styles.salesCell}>
                    <StackedBarChart
                      datasets={rowEbitdaDatasets}
                      total={rowEbitdaTotal}
                      height={60}
                    />
                  </td>
                  <td className={styles.selfPriceCell}>
                    {withoutNds !== 0 || withNds !== 0 ? (
                      <SelfPriceCellInline withNds={withNds} withoutNds={withoutNds} />
                    ) : '—'}
                  </td>
                  {turnoverColumns.map((col) => (
                    <td key={col.key} className={styles.salesCell}>
                      {renderTurnoverLines(col)}
                    </td>
                  ))}
                </tr>
                );
              })}
            </tbody>
          </table>
          </div>
        </div>
      )}

      {/* Сезонные графики под таблицей размеров. */}
      {(ordersSeasonalKoefs.length > 0 || pricesSeasonalKoefs.length > 0) && (
        <div className={styles.seasonalRow}>
          {ordersSeasonalKoefs.length > 0 && (
            <div className={`card ${styles.chartCard}`}>
              <span className={styles.miniTitle}>Сезонность заказов</span>
              <SeasonalChart data={ordersSeasonalKoefs} />
            </div>
          )}
          {pricesSeasonalKoefs.length > 0 && (
            <div className={`card ${styles.chartCard}`}>
              <span className={styles.miniTitle}>Сезонность цен</span>
              <SeasonalChart data={pricesSeasonalKoefs} />
            </div>
          )}
        </div>
      )}

      {vendorCopied
        ? createPortal(
            <span className={styles.vendorToast} style={tooltipPos}>
              Скопировано
            </span>,
            document.body
          )
        : null}
    </div>
  );
};

export default SkuDetailPage;