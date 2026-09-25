import React, { useRef, useLayoutEffect, useCallback, useState, useMemo, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaExternalLinkAlt } from 'react-icons/fa';
import { MdCleaningServices } from 'react-icons/md';
import { TiFilter } from 'react-icons/ti';
import { BarChart, OrdersPriceChart } from '../../../shared/ui';
import { isValidDateFormat } from '../lib/gantt';
import styles from './SkuPlantCard.module.css';

// Цвет плашки по значению ABC (как на странице Артикула).
const abcClass = (value) => {
  const key = `abc_${String(value || '').toLowerCase()}`;
  if (styles[key]) return styles[key];
  return styles.abcNeutral;
};

// ─── Date mask ────────────────────────────────────────────────────────────────
const DateMaskInput = ({ defaultValue, onValidDate, className }) => {
  const inputRef = React.useRef(null);

  React.useLayoutEffect(() => {
    if (inputRef.current && document.activeElement !== inputRef.current) {
      inputRef.current.value = defaultValue || '';
    }
  }, [defaultValue]);

  const handleKeyDown = (e) => {
    const ctrl = ['Backspace','Delete','Tab','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'];
    if (ctrl.includes(e.key)) return;
    if (!/^\d$/.test(e.key)) { e.preventDefault(); return; }
    const raw = e.currentTarget.value.replace(/\D/g, '');
    if (raw.length === 4 && Number(e.key) > 1) { e.preventDefault(); return; }
    if (raw.length === 5) {
      if (raw[4] === '1' && Number(e.key) > 2) { e.preventDefault(); return; }
      if (raw[4] === '0' && e.key === '0') { e.preventDefault(); return; }
    }
    if (raw.length === 6 && Number(e.key) > 3) { e.preventDefault(); return; }
    if (raw.length === 7) {
      if (raw[6] === '3' && Number(e.key) > 1) { e.preventDefault(); return; }
      if (raw[6] === '0' && e.key === '0') { e.preventDefault(); return; }
    }
    if (raw.length >= 8) { e.preventDefault(); return; }
  };

  const handleChange = (e) => {
    const digits = e.target.value.replace(/\D/g, '').slice(0, 8);
    let fmt = digits.slice(0,4);
    if (digits.length > 4) fmt += '-' + digits.slice(4,6);
    if (digits.length > 6) fmt += '-' + digits.slice(6,8);
    e.target.value = fmt;
    if (/^\d{4}-\d{2}-\d{2}$/.test(fmt)) onValidDate(fmt);
  };

  return (
    <input
      ref={inputRef}
      type="text" maxLength={10} placeholder="ГГГГ-ММ-ДД"
      defaultValue={defaultValue || ''}
      onKeyDown={handleKeyDown}
      onChange={handleChange}
      className={className}
    />
  );
};

// ─── SkuPlantCard ────────────────────────────────────────────────────────────
const SkuPlantCard = ({
  sku,
  startCalcDate,
  extraOrders,
  fullSkuList,
  onStartCalcDateChange,
  onApplyStartCalcDateToAll,
  onClearRow,
  onCategoryFilter,
  onPatternFilter,
  onCountryFilter,
}) => {
  const [copied, setCopied] = useState(false);
  const [fadeOut, setFadeOut] = useState(false);
  const copyTimers = useRef([]);
  const [skuCopied, setSkuCopied] = useState(false);
  const skuTimer = useRef(null);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(sku.vendorCode).then(() => {
      copyTimers.current.forEach((t) => clearTimeout(t));
      setFadeOut(false);
      setCopied(true);
      copyTimers.current[0] = setTimeout(() => setFadeOut(true), 600);
      copyTimers.current[1] = setTimeout(() => { setCopied(false); setFadeOut(false); }, 1400);
    });
  }, [sku.vendorCode]);

  const handleCopySku = useCallback(() => {
    navigator.clipboard.writeText(String(sku.sku)).then(() => {
      clearTimeout(skuTimer.current);
      setSkuCopied(true);
      skuTimer.current = setTimeout(() => setSkuCopied(false), 1000);
    });
  }, [sku.sku]);

  const startDate = sku.startOfRealizationDate
    ? sku.startOfRealizationDate.split('-').reverse().join('.')
    : '—';

  // Измеряем ширину колонки метрик, чтобы графики совпадали по ширине.
  const metricsRef = useRef(null);
  const [chartWidth, setChartWidth] = useState(0);
  useLayoutEffect(() => {
    if (metricsRef.current) {
      const w = Math.floor((metricsRef.current.offsetWidth - 7) / 2);
      if (w > 80) setChartWidth(w);
    }
  }, []);

  // Среднее по CРО — сводка для столбчатой диаграммы.
  const cpoMean = useMemo(() => {
    const entries = Object.entries(sku.cpo || {});
    const valid = entries.filter(
      ([, v]) => v != null && v !== '' && !isNaN(Number(v))
    );
    if (valid.length === 0) return '—';
    const sum = valid.reduce((s, [, v]) => s + Number(v), 0);
    return (sum / valid.length).toLocaleString('ru-RU', {
      maximumFractionDigits: 1,
    });
  }, [sku.cpo]);

  // Есть ли что очищать в строке: введённые заказы или дата расчёта.
  const hasClearable =
    Boolean(startCalcDate) ||
    (sku.sizes || []).some((c) => (extraOrders?.[c.chartId] || 0) > 0);

  return (
    <div className={styles.skuCard}>
      {/* Header */}
      <div className={styles.cardHeader}>
        <button className={styles.vcNameBtn} onClick={handleCopy} title="Нажмите чтобы скопировать">
          <span className={styles.vcNameRow}>
            <span className={styles.vcName}>{sku.vendorCode}</span>
            {copied && (
              <span className={`${styles.copyHint} ${fadeOut ? styles.copyHintFadeOut : styles.copyHintFadeIn}`}>
                Скопировано
              </span>
            )}
          </span>
          <span className={styles.vcHeaderDate}>Старт продаж: {startDate}</span>
        </button>
        <div className={styles.headerActions}>
          <Link
            to={`/skus/${sku.sku}`}
            target="_blank"
            className={styles.iconBtn}
            title="Открыть карточку товара"
          >
            <FaExternalLinkAlt />
          </Link>
          <button
            className={`${styles.iconBtn} ${styles.iconBtnDelete}`}
            onClick={onClearRow}
            title="Очистить вводы строки"
            disabled={!hasClearable}
          >
            <MdCleaningServices />
          </button>
        </div>
      </div>

      {/* Body */}
      <div className={styles.cardBody}>
        <div className={styles.infoCol}>
          {/* Date */}
          <div className={styles.dateRow}>
            <span className={styles.dateLabel}>Дата расчёта</span>
            <DateMaskInput
              defaultValue={startCalcDate}
              onValidDate={(v) => onStartCalcDateChange(sku.vendorCode, v)}
              className={styles.dateInput}
            />
            <button
              className={styles.applyAllBtn}
              onClick={() => onApplyStartCalcDateToAll(sku.vendorCode, fullSkuList)}
              disabled={!startCalcDate}
            >
              Все
            </button>
          </div>

          {/* Chip row */}
          <div className={styles.chipsRow}>
            <span
              className={styles.skuBadge}
              onClick={handleCopySku}
              title="Скопировать SKU"
            >
              <span className={styles.badgeSlideWrap}>
                <span
                  className={`${styles.badgeSlide} ${skuCopied ? styles.badgeSlideCopied : ''}`}
                >
                  <span className={styles.badgeSlideItem}>{sku.sku}</span>
                  <span className={styles.badgeSlideItem}>Скопировано</span>
                </span>
              </span>
            </span>
            {sku.category && (
              <span className={styles.categoryBadge}>
                <span className={styles.badgeLabel}>{sku.category}</span>
                <button
                  type="button"
                  className={styles.badgeFilter}
                  title="Фильтровать по категории"
                  aria-label={`Фильтровать по категории ${sku.category}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCategoryFilter && onCategoryFilter(sku.category);
                  }}
                >
                  <TiFilter />
                </button>
              </span>
            )}
            <span className={styles.patternBadge}>
              <span className={styles.badgeLabel}>
                {sku.pattern || 'Не определено'}
              </span>
              <button
                type="button"
                className={styles.badgeFilter}
                title="Фильтровать по лекалу"
                aria-label={`Фильтровать по лекалу ${sku.pattern || 'Не определено'}`}
                onClick={(e) => {
                  e.stopPropagation();
                  onPatternFilter && onPatternFilter(sku.pattern || '');
                }}
              >
                <TiFilter />
              </button>
            </span>
            {sku.country && (
              <span className={styles.countryBadge}>
                <span className={styles.badgeLabel}>{sku.country}</span>
                <button
                  type="button"
                  className={styles.badgeFilter}
                  title="Фильтровать по стране"
                  aria-label={`Фильтровать по стране ${sku.country}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    onCountryFilter && onCountryFilter(sku.country);
                  }}
                >
                  <TiFilter />
                </button>
              </span>
            )}
          </div>

          {/* Metrics */}
          <div className={styles.metricsGrid} ref={metricsRef}>
            <Metric label="EBITDA/день" value={`${(sku.totalEbitdaAvg||0).toLocaleString()} ₽`} />
            <Metric label="EBITDA" value={`${(sku.ebitdaAvg||0).toLocaleString()} ₽`} />
            <SelfPriceMetric
              withNds={sku.selfpriceWithNds}
              withoutNds={sku.selfpriceWithoutNds}
            />
            <Metric label="ROI" value={sku.roi != null ? `${sku.roi}%` : '—'} />
          </div>

          {/* Charts — same width as metric boxes */}
          <div className={styles.chartsRow}>
            <div className={styles.chartWrap} style={{ width: chartWidth }}>
              <span className={styles.chartTitle}>Заказы</span>
              <OrdersPriceChart
                orders={sku.ordersTotal}
                price={sku.price}
                summary={(sku.ordersTotalSum || 0).toLocaleString()}
                height={62}
              />
            </div>
            <div className={styles.chartWrap} style={{ width: chartWidth }}>
              <span className={styles.chartTitle}>СРО</span>
              <BarChart
                data={sku.cpo}
                summary={cpoMean}
                color="#F59E0B"
                height={62}
              />
            </div>
          </div>
        </div>

        {/* Image */}
        <div className={styles.imageCol}>
          <div className={styles.imageWrap}>
            <img
              className={styles.photo}
              src={sku.image}
              alt={sku.vendorCode}
              title={sku.vendorCode}
              loading="lazy"
              decoding="async"
              onError={(e) => {
                e.currentTarget.style.visibility = 'hidden';
              }}
            />
            <div className={styles.abcOverlay}>
              {sku.abcAmongAllCurrent && (
                <span
                  className={`${styles.abcCard} ${abcClass(sku.abcAmongAllCurrent)}`}
                >
                  <span className={styles.abcLabel}>Бренд</span>
                  <b className={styles.abcValue}>{sku.abcAmongAllCurrent}</b>
                </span>
              )}
              {sku.abcAmongCategoryCurrent && (
                <span
                  className={`${styles.abcCard} ${abcClass(sku.abcAmongCategoryCurrent)}`}
                >
                  <span className={styles.abcLabel}>Категория</span>
                  <b className={styles.abcValue}>{sku.abcAmongCategoryCurrent}</b>
                </span>
              )}
            </div>
            <span className={`${styles.abcCard} ${styles.buyoutCard}`}>
              <span className={styles.abcLabel}>% Выкупа</span>
              <b className={styles.abcValue}>
                {sku.buyoutPercentMedian != null
                  ? `${sku.buyoutPercentMedian}%`
                  : '—'}
              </b>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

const Metric = ({ label, value }) => (
  <div className={styles.metricBox}>
    <div className={styles.metricLabel}>{label}</div>
    <div className={styles.metricValue}>{value}</div>
  </div>
);

/**
 * Плашка «Себестоимость» — анимация как в таблице Товаров:
 * по умолчанию значение без НДС, при наведении число плавно пересчитывается
 * к значению с НДС, а подпись (с НДС / без НДС) появляется справа от числа.
 */
const SelfPriceMetric = ({ withNds, withoutNds }) => {
  const withN = Number(withNds) || 0;
  const withoutN = Number(withoutNds) || 0;
  const [hovered, setHovered] = useState(false);
  const [displayValue, setDisplayValue] = useState(withoutN);
  const intervalRef = useRef(null);

  useEffect(() => {
    if (hovered) {
      const start = withoutN;
      const end = withN;
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
      setDisplayValue(withoutN);
    }

    return () => clearInterval(intervalRef.current);
  }, [hovered, withN, withoutN]);

  return (
    <div
      className={styles.metricBox}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div className={styles.metricLabel}>Себестоимость</div>
      <div className={styles.selfPriceRow}>
        <span className={styles.metricValue}>
          {Math.round(displayValue).toLocaleString()} ₽
        </span>
        <span className={styles.ndsLabelStack}>
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
    </div>
  );
};

export default SkuPlantCard;