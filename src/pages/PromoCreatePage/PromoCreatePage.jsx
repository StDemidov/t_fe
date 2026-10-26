import { useEffect, useMemo, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FiSearch, FiX, FiTrash2 } from 'react-icons/fi';
import { RiFocus3Fill } from 'react-icons/ri';
import { IoSettings } from 'react-icons/io5';
import { BiSolidMapPin } from 'react-icons/bi';
import { FiDatabase, FiInfo } from 'react-icons/fi';
import { FaWarehouse } from 'react-icons/fa6';
import { FaTshirt } from 'react-icons/fa';
import { BsCalendar2CheckFill } from 'react-icons/bs';
import { TbTargetArrow } from 'react-icons/tb';
import { FaRegClock } from 'react-icons/fa';
import { FaCheck } from 'react-icons/fa';
import * as XLSX from 'xlsx';
import { selectUser } from '../../redux/slices/authSlice';
import { setNotification } from '../../redux/slices/notificationSlice';
import {
  createPromo,
  fetchPromoBalance,
  fetchPromoSkusForCampaign,
} from '../../entities/promo';
import '../../app/styles/global.css';
import styles from './PromoCreatePage.module.css';

const formatMoney = (value) =>
  new Intl.NumberFormat('ru-RU', {
    maximumFractionDigits: 2,
  }).format(Number(value) || 0);

const roundUpToHundreds = (value) => {
  const digits = String(value ?? '').replace(/\D/g, '');
  if (!digits) return '';
  const number = Number(digits);
  if (number <= 0) return digits;
  return String(Math.ceil(number / 100) * 100);
};

const MIN_START_BUDGET = 1000;

const BalanceCard = ({ title, value, selected, disabled, onClick }) => (
  <button
    type="button"
    className={`${styles.balanceCard} ${selected ? styles.balanceCardSelected : ''}`}
    disabled={disabled}
    onClick={onClick}
  >
    <span className={styles.balanceTitle}>{title}</span>
    <strong className={styles.balanceValue}>{formatMoney(value)} ₽</strong>
  </button>
);

const SettingCard = ({ number, icon: Icon, title, description, children }) => (
  <section className={styles.settingCard}>
    <header className={styles.settingCardHeader}>
      <span className={styles.settingCardMeta}>
        <span className={styles.settingNumber}>{number}</span>
        <span className={styles.settingIcon}>
          <Icon />
        </span>
      </span>
      <h3 className={styles.settingTitle}>{title}</h3>
    </header>
    {description ? (
      <p className={styles.settingDescription}>{description}</p>
    ) : null}
    {children}
  </section>
);

const SkuInfo = ({ item }) => {
  const nameRef = useRef(null);
  const nameContainerRef = useRef(null);
  const [overflowing, setOverflowing] = useState(false);
  const [skuCopied, setSkuCopied] = useState(false);
  const skuTimerRef = useRef(null);

  useEffect(() => {
    const checkOverflow = () => {
      if (nameRef.current && nameContainerRef.current) {
        setOverflowing(
          nameRef.current.scrollWidth > nameContainerRef.current.clientWidth
        );
      }
    };
    checkOverflow();
    window.addEventListener('resize', checkOverflow);
    return () => window.removeEventListener('resize', checkOverflow);
  }, [item.vendorcode]);

  useEffect(() => () => clearTimeout(skuTimerRef.current), []);

  const handleCopySku = async (event) => {
    event.stopPropagation();
    if (item.sku == null) return;
    try {
      await navigator.clipboard.writeText(String(item.sku));
    } catch {
      return;
    }
    setSkuCopied(true);
    clearTimeout(skuTimerRef.current);
    skuTimerRef.current = setTimeout(() => setSkuCopied(false), 1000);
  };

  return (
    <div className={styles.skuInfo}>
      <div
        ref={nameContainerRef}
        className={`${styles.skuNameWrap} ${
          overflowing ? styles.skuNameOverflow : ''
        }`}
        title={item.vendorcode || '—'}
      >
        <span className={styles.skuNameTrack}>
          <span ref={nameRef} className={styles.skuNameItem}>
            {item.vendorcode || '—'}
          </span>
          {overflowing ? (
            <span className={styles.skuNameItem}>
              {item.vendorcode || '—'}
            </span>
          ) : null}
        </span>
      </div>
      {item.sku != null ? (
        <span
          className={styles.skuBadge}
          onClick={handleCopySku}
          title="Скопировать SKU"
        >
          <span className={styles.badgeSlideWrap}>
            <span
              className={`${styles.badgeSlide} ${
                skuCopied ? styles.badgeSlideCopied : ''
              }`}
            >
              <span className={styles.badgeSlideItem}>{item.sku}</span>
              <span className={styles.badgeSlideItem}>Скопировано</span>
            </span>
          </span>
        </span>
      ) : (
        <span>SKU: —</span>
      )}
    </div>
  );
};

const SkuCard = ({ item, selected, onClick, onRemove }) => (
  <article
    className={`${styles.skuCard} ${selected ? styles.skuCardSelected : ''}`}
    onClick={onClick}
  >
    {item.photo ? (
      <span className={styles.skuPhotoWrap}>
        <img
          className={styles.skuPhoto}
          src={item.photo}
          alt={item.vendorcode || item.sku}
        />
        {selected ? (
          <span
            className={`${styles.skuPhotoOverlay} ${
              selected ? styles.skuPhotoOverlayVisible : ''
            }`}
          >
            <span className={styles.skuPhotoCheck}>
              <FaCheck />
            </span>
          </span>
        ) : null}
      </span>
    ) : (
      <div className={styles.noPhoto}>?</div>
    )}
    <SkuInfo item={item} />
    {onRemove ? (
      <button
        type="button"
        className={styles.removeSku}
        aria-label="Убрать артикул"
        onClick={(event) => {
          event.stopPropagation();
          onRemove();
        }}
      >
        <FiX />
      </button>
    ) : null}
  </article>
);

const PromoCreatePage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const canManage = Boolean(
    user?.permissions?.ad_camps_manage || user?.permissions?.is_admin
  );
  const [skus, setSkus] = useState([]);
  const [balance, setBalance] = useState(null);
  const [sourceType, setSourceType] = useState(1);
  const [selectedSkus, setSelectedSkus] = useState(() => new Set());
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [campaignType, setCampaignType] = useState('unified');
  const [placements, setPlacements] = useState({
    search: true,
    recommendations: true,
  });
  const [bids, setBids] = useState({
    search: '300',
    recommendations: '300',
  });
  const [budget, setBudget] = useState({
    start: '5000',
    floor: '2000',
    replenishment: '3000',
  });
  const [clusterThresholds, setClusterThresholds] = useState({
    views: '100',
    ctr: '0.75',
    ctrValue: 0.0075,
  });
  const [checkTurnover, setCheckTurnover] = useState(true);
  const [turnoverByBarcodes, setTurnoverByBarcodes] = useState(false);
  const [turnover, setTurnover] = useState({
    threshold: '1',
    days: '1',
  });
  const [daysToFixing, setDaysToFixing] = useState('1');
  const [allDayActivity, setAllDayActivity] = useState(true);
  const [activityHours, setActivityHours] = useState({
    start: '16',
    pause: '22',
  });
  const [skusLoading, setSkusLoading] = useState(true);
  const [balanceLoading, setBalanceLoading] = useState(true);
  const [skusError, setSkusError] = useState('');
  const [balanceError, setBalanceError] = useState('');
  const [excelMessage, setExcelMessage] = useState('');
  const [createLoading, setCreateLoading] = useState(false);
  const [createError, setCreateError] = useState('');
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (!canManage) {
      setSkusLoading(false);
      setBalanceLoading(false);
      return undefined;
    }

    let active = true;
    fetchPromoSkusForCampaign()
      .then((data) => {
        if (active) setSkus(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setSkusError('Не удалось загрузить доступные артикулы');
      })
      .finally(() => {
        if (active) setSkusLoading(false);
      });

    return () => {
      active = false;
    };
  }, [canManage]);

  useEffect(() => {
    if (!canManage) return undefined;

    let active = true;
    fetchPromoBalance()
      .then((data) => {
        if (active) setBalance(data);
      })
      .catch(() => {
        if (active) setBalanceError('Не удалось загрузить состояние счетов');
      })
      .finally(() => {
        if (active) setBalanceLoading(false);
      });

    return () => {
      active = false;
    };
  }, [canManage]);

  const searchResults = useMemo(() => {
    const query = submittedSearch.trim().toLowerCase();
    if (!query) return [];
    return skus.filter((item) =>
      [item.sku, item.vendorcode].some((value) =>
        String(value || '').toLowerCase().includes(query)
      )
    );
  }, [skus, submittedSearch]);

  const selectedItems = skus.filter((item) => selectedSkus.has(String(item.sku)));
  const balanceData = balance?.balance || {};
  const account = balanceData[0] ?? balanceData.balance ?? 0;
  const net = balanceData[1] ?? balance?.net ?? balanceData.net ?? 0;
  const bonus = balanceData[3] ?? balance?.bonus ?? balanceData.bonus ?? 0;
  const cashback = balance?.cashback || balance?.cashbacks || {};
  const roundedBudget = useMemo(
    () => ({
      start: roundUpToHundreds(budget.start),
      floor: roundUpToHundreds(budget.floor),
      replenishment: roundUpToHundreds(budget.replenishment),
    }),
    [budget]
  );
  const startBudget = Number(roundedBudget.start) || 0;
  const sourceAmounts = {
    0: Number(account) || 0,
    1: Number(net) || 0,
    3: Number(bonus) || 0,
  };

  useEffect(() => {
    const currentSourceAvailable =
      sourceAmounts[sourceType] >= startBudget;
    const balanceAvailable = sourceAmounts[1] >= startBudget;
    if (!currentSourceAvailable && balanceAvailable) {
      setSourceType(1);
    }
  }, [startBudget, account, net, bonus, sourceType]);

  const toggleSku = (item) => {
    const key = String(item.sku);
    setSelectedSkus((current) => {
      const next = new Set(current);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const clearSelected = () => {
    setSelectedSkus(new Set());
  };

  const handleCampaignTypeChange = (type) => {
    setCampaignType(type);
    if (type === 'unified') {
      const unifiedBid =
        Number(bids.search) > 0
          ? bids.search
          : Number(bids.recommendations) > 0
            ? bids.recommendations
            : '300';
      setPlacements({
        search: true,
        recommendations: true,
      });
      setBids({
        search: unifiedBid,
        recommendations: unifiedBid,
      });
    } else {
      setPlacements({
        search: true,
        recommendations: true,
      });
      setBids((current) => ({
        search: Number(current.search) > 0 ? current.search : '300',
        recommendations:
          Number(current.recommendations) > 0
            ? current.recommendations
            : '300',
      }));
    }
  };

  const togglePlacement = (placement) => {
    if (campaignType === 'unified') return;
    const otherPlacement =
      placement === 'search' ? 'recommendations' : 'search';
    if (placements[placement] && !placements[otherPlacement]) return;

    const nextEnabled = !placements[placement];
    setPlacements((current) => ({
      ...current,
      [placement]: nextEnabled,
    }));
    if (!nextEnabled) {
      setBids((current) => ({
        ...current,
        [placement]: '0',
      }));
    } else {
      setBids((current) => ({
        ...current,
        [placement]: '300',
      }));
    }
  };

  const handleBidChange = (placement, value) => {
    const digits = value.replace(/\D/g, '');
    const nextValue = digits === '' ? '' : String(Math.max(Number(digits), 1));
    if (campaignType === 'unified') {
      setBids({
        search: nextValue,
        recommendations: nextValue,
      });
      return;
    }
    setBids((current) => ({
      ...current,
      [placement]: nextValue,
    }));
  };

  const handleBudgetChange = (field, value) => {
    setBudget((current) => ({
      ...current,
      [field]: value.replace(/\D/g, ''),
    }));
  };

  const handleBudgetCommit = (field) => {
    setBudget((current) => ({
      ...current,
      [field]: roundUpToHundreds(current[field]),
    }));
  };

  const handleClusterCtrChange = (value) => {
    const normalized = value.replace(/,/g, '.').replace(/[^0-9.]/g, '');
    const parsed = Number(normalized);
    setClusterThresholds((current) => ({
      ...current,
      ctr: normalized,
      ctrValue: Number.isFinite(parsed) && parsed > 0 ? parsed / 100 : 0,
    }));
  };

  const budgetFields = [
    ['start', 'Стартовый бюджет'],
    ['floor', 'Порог пополнения'],
    ['replenishment', 'Сумма пополнения'],
  ];

  const hours = Array.from({ length: 24 }, (_, hour) =>
    String(hour).padStart(2, '0')
  );

  const settingErrors = [
    ...(selectedItems.length === 0
      ? ['Выберите хотя бы 1 артикул']
      : []),
    ...(['search', 'recommendations']
      .filter((key) => placements[key] && Number(bids[key]) <= 0)
      .map((key) =>
        key === 'search'
          ? 'Ставка Поиск должна быть больше нуля'
          : 'Ставка Рекомендации должна быть больше нуля'
      )),
    ...budgetFields
      .filter(([key]) => Number(roundedBudget[key]) <= 0)
      .map(([, label]) => `${label} не может быть нулевым`),
    ...(Number(roundedBudget.start) > 0 &&
    Number(roundedBudget.start) < MIN_START_BUDGET
      ? [`Стартовый бюджет не может быть меньше ${MIN_START_BUDGET}`]
      : []),
    ...(campaignType === 'unified' && Number(clusterThresholds.views) <= 0
      ? ['Порог показов для кластеров должен быть больше нуля']
      : []),
    ...(campaignType === 'unified' && clusterThresholds.ctrValue <= 0
      ? ['Порог CTR для кластеров должен быть больше нуля']
      : []),
    ...(checkTurnover && Number(turnover.threshold) <= 0
      ? ['Порог оборачиваемости должен быть больше нуля']
      : []),
    ...(checkTurnover && Number(turnover.days) <= 0
      ? ['Дней для расчета оборачиваемости должно быть больше нуля']
      : []),
    ...(campaignType === 'unified' && Number(daysToFixing) <= 0
      ? ['Кол-во дней до фиксации метрик должно быть больше нуля']
      : []),
    ...(!allDayActivity &&
    (!activityHours.start ||
      !activityHours.pause ||
      activityHours.start === activityHours.pause)
      ? ['Часы активности должны отличаться']
      : []),
  ];
  const placementSummary = [
    placements.search ? 'Поиск' : '',
    placements.recommendations ? 'Рекомендации' : '',
  ]
    .filter(Boolean)
    .join(' / ');

  /** Тело запроса advert/create — по одному объекту на каждый выбранный SKU. */
  const buildCampaignPayload = useMemo(() => {
    const isUnified = campaignType === 'unified';
    const recBid = Number(bids.recommendations) || 0;
    const searchBid = isUnified ? recBid : Number(bids.search) || 0;
    const hasActiveHours = !allDayActivity;

    return selectedItems.map((item) => ({
      sku: Number(item.sku),
      bid_type: isUnified ? 'unified' : 'manual',
      payment_type: 'cpm',
      search_placement: isUnified ? true : placements.search,
      rec_placement: isUnified ? true : placements.recommendations,
      search_bid: searchBid,
      rec_bid: recBid,
      budget: Number(roundedBudget.start) || 0,
      balance_type: sourceType,
      budget_floor: Number(roundedBudget.floor) || 0,
      replinishment_amount: Number(roundedBudget.replenishment) || 0,
      views_bench: Number(clusterThresholds.views) || 0,
      ctr_bench: clusterThresholds.ctrValue || 0,
      lower_turnover_threshold: checkTurnover
        ? Number(turnover.threshold) || 0
        : 0,
      turnover_days: checkTurnover ? Number(turnover.days) || 0 : 1,
      turnover_by_barcodes: turnoverByBarcodes,
      has_active_hours: hasActiveHours,
      ...(hasActiveHours
        ? {
            start_hour: Number(activityHours.start) || 0,
            pause_hour: Number(activityHours.pause) || 0,
          }
        : {}),
      days_to_fixing_metrics: isUnified ? Number(daysToFixing) || 0 : 0,
    }));
  }, [
    allDayActivity,
    activityHours,
    bids,
    campaignType,
    checkTurnover,
    clusterThresholds,
    daysToFixing,
    placements,
    roundedBudget,
    selectedItems,
    sourceType,
    turnover,
    turnoverByBarcodes,
  ]);

  const handleExcelUpload = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    try {
      const buffer = await file.arrayBuffer();
      const workbook = XLSX.read(buffer, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, {
        header: 1,
        defval: '',
      });
      const values = rows
        .map((row) => String(row[0] ?? '').trim().toLowerCase())
        .filter(Boolean);
      const matches = skus.filter((item) =>
        values.includes(String(item.sku ?? '').trim().toLowerCase()) ||
        values.includes(String(item.vendorcode ?? '').trim().toLowerCase())
      );
      const matchedKeys = matches.map((item) => String(item.sku));
      setSelectedSkus((current) =>
        new Set([...current, ...matchedKeys])
      );
      setExcelMessage(
        `Добавлено: ${matches.length}. Не найдено: ${Math.max(
          values.length - matches.length,
          0
        )}.`
      );
    } catch {
      setExcelMessage('Не удалось прочитать Excel-файл');
    }
  };

  const handleCreateCampaign = async () => {
    if (settingErrors.length > 0) return;

    console.log(
      '[advert/create] payload:',
      JSON.stringify(buildCampaignPayload, null, 2)
    );

    setCreateLoading(true);
    setCreateError('');
    try {
      const created = await createPromo(buildCampaignPayload);
      console.log('[advert/create] response:', created);
      dispatch(
        setNotification(
          buildCampaignPayload.length === 1
            ? 'Кампания успешно создана'
            : 'Кампании успешно созданы'
        )
      );
    } catch (error) {
      const message =
        error?.response?.data?.detail ||
        error?.message ||
        'Не удалось создать рекламную кампанию';
      setCreateError(message);
    } finally {
      setCreateLoading(false);
    }
  };

  if (!canManage) {
    return (
      <div className={`page ${styles.root}`}>
        <div className={`card ${styles.accessDenied}`}>
          Нет доступа к созданию рекламных кампаний
        </div>
      </div>
    );
  }

  return (
    <div className={`page ${styles.root}`}>
      <header className="pageHeader">
        <h1 className="pageTitle">Создание рекламной кампании</h1>
      </header>

      <div className={styles.createLayout}>
        <section className={styles.settingsBlock}>
          <div className={styles.settingsHeading}>
            <div className={styles.settingsHeadingIcon}>
              <IoSettings />
            </div>
            <div className={styles.settingsHeadingText}>
              <h2>Настройки кампании</h2>
              <p>Задайте параметры продвижения и выберите товары</p>
            </div>
          </div>
          <SettingCard
            number="1"
            icon={RiFocus3Fill}
            title="Тип кампании"
            description="Выберите тип рекламной кампании"
          >
            <div className={styles.typeSwitch}>
              {[
                ['manual', 'Ручная'],
                ['unified', 'Единая'],
              ].map(([value, label]) => (
                <button
                  key={value}
                  type="button"
                  className={
                    campaignType === value ? styles.typeActive : ''
                  }
                  onClick={() => handleCampaignTypeChange(value)}
                >
                  {label}
                </button>
              ))}
            </div>
          </SettingCard>

          <SettingCard
            number="2"
            icon={BiSolidMapPin}
            title="Места размещения"
            description="Выберите места показа вашей рекламы"
          >
            <div className={styles.placementList}>
              {[
                ['search', 'Поиск'],
                ['recommendations', 'Рекомендации'],
              ].map(([key, label]) => (
                <button
                  key={key}
                  type="button"
                  className={`${styles.placementButton} ${
                    placements[key] ? styles.placementActive : ''
                  }`}
                  disabled={campaignType === 'unified'}
                  onClick={() => togglePlacement(key)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className={styles.settingLabel}>Ставки</div>
            <div className={`${styles.bidList} ${styles.fieldGroup}`}>
              {[
                ['search', 'Поиск'],
                ['recommendations', 'Рекомендации'],
              ].map(([key, label]) => (
                <label key={key} className={styles.bidRow}>
                  <span>{label}</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={
                      placements[key] && Number(bids[key]) <= 0
                        ? styles.inputInvalid
                        : ''
                    }
                    value={bids[key]}
                    disabled={!placements[key]}
                    onChange={(event) =>
                      handleBidChange(key, event.target.value)
                    }
                  />
                </label>
              ))}
            </div>
          </SettingCard>

          <SettingCard
            number="3"
            icon={FiDatabase}
            title="Бюджет"
            description="Укажите бюджет и ограничения кампании"
          >
            <div className={styles.budgetList}>
              {budgetFields.map(([key, label]) => (
                <label key={key} className={styles.budgetRow}>
                  <span>{label}</span>
                  <input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    className={
                      Number(roundedBudget[key]) <= 0 ||
                      (key === 'start' &&
                        Number(roundedBudget.start) > 0 &&
                        Number(roundedBudget.start) < MIN_START_BUDGET)
                        ? styles.inputInvalid
                        : ''
                    }
                    value={budget[key]}
                    onChange={(event) =>
                      handleBudgetChange(key, event.target.value)
                    }
                    onBlur={() => handleBudgetCommit(key)}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        handleBudgetCommit(key);
                      }
                    }}
                  />
                </label>
              ))}
            </div>
            <h3 className={styles.subTitle}>Источник пополнения</h3>
            {balanceLoading ? (
              <div className={styles.balanceStack}>
                {Array.from({ length: 3 }, (_, index) => (
                  <span key={index} className={styles.skeletonCard} />
                ))}
              </div>
            ) : balanceError ? (
              <div className={styles.error}>{balanceError}</div>
            ) : (
              <div className={styles.balanceStack}>
                <BalanceCard
                  title="Счёт"
                  value={account}
                  selected={sourceType === 0}
                  disabled={sourceAmounts[0] < startBudget}
                  onClick={() => setSourceType(0)}
                />
                <BalanceCard
                  title="Баланс"
                  value={net}
                  selected={sourceType === 1}
                  disabled={sourceAmounts[1] < startBudget}
                  onClick={() => setSourceType(1)}
                />
                <BalanceCard
                  title="Бонусы"
                  value={bonus}
                  selected={sourceType === 3}
                  disabled={sourceAmounts[3] < startBudget}
                  onClick={() => setSourceType(3)}
                />
              </div>
            )}
            {!balanceLoading && !balanceError ? (
              <div className={styles.cashbackInfo}>
                <span>Кешбэк</span>
                <strong>
                  {formatMoney(cashback.amount ?? cashback.sum ?? 0)} ₽
                </strong>
                <em>{cashback.percent ?? 0}%</em>
              </div>
            ) : null}
          </SettingCard>

          <SettingCard
            number="4"
            icon={TbTargetArrow}
            title="Пороги для кластеров"
            description="Задайте минимальные значения для кластеров"
          >
            <div className={styles.fieldGroup}>
              <label className={styles.numberRow}>
                <span>Показы</span>
                <input
                  type="text"
                  inputMode="numeric"
                  pattern="[0-9]*"
                  value={clusterThresholds.views}
                  disabled={campaignType !== 'unified'}
                  className={
                    campaignType === 'unified' &&
                    Number(clusterThresholds.views) <= 0
                      ? styles.inputInvalid
                      : ''
                  }
                  onChange={(event) =>
                    setClusterThresholds((current) => ({
                      ...current,
                      views: event.target.value.replace(/\D/g, ''),
                    }))
                  }
                />
              </label>
              <label className={styles.numberRow}>
                <span>CTR</span>
                <input
                  type="text"
                  inputMode="decimal"
                  value={clusterThresholds.ctr}
                  disabled={campaignType !== 'unified'}
                  className={
                    campaignType === 'unified' &&
                    clusterThresholds.ctrValue <= 0
                      ? styles.inputInvalid
                      : ''
                  }
                  onChange={(event) => handleClusterCtrChange(event.target.value)}
                />
              </label>
            </div>
          </SettingCard>

          <SettingCard
            number="5"
            icon={FaWarehouse}
            title="Проверка оборачиваемости"
            description="Настройте проверку эффективности кампании"
          >
            <button
              type="button"
              className={`${styles.settingToggle} ${
                checkTurnover ? styles.settingToggleActive : ''
              }`}
              onClick={() => setCheckTurnover((current) => !current)}
            >
              Проверять оборачиваемость
            </button>
            <div className={`${styles.choiceGroup} ${styles.choiceGroupCenter}`}>
              {[
                [false, 'По артикулу'],
                [true, 'По размерам'],
              ].map(([value, label]) => (
                <button
                  key={label}
                  type="button"
                  className={
                    turnoverByBarcodes === value ? styles.choiceActive : ''
                  }
                  disabled={!checkTurnover}
                  onClick={() => setTurnoverByBarcodes(value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className={styles.numberSettings}>
              <label className={styles.numberRow}>
                <span>Порог оборачиваемости</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={turnover.threshold}
                  disabled={!checkTurnover}
                  className={
                    checkTurnover && Number(turnover.threshold) <= 0
                      ? styles.inputInvalid
                      : ''
                  }
                  onChange={(event) =>
                    setTurnover((current) => ({
                      ...current,
                      threshold: event.target.value.replace(/\D/g, ''),
                    }))
                  }
                />
              </label>
              <label className={styles.numberRow}>
                <span>Дней для расчета</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={turnover.days}
                  disabled={!checkTurnover}
                  className={
                    checkTurnover && Number(turnover.days) <= 0
                      ? styles.inputInvalid
                      : ''
                  }
                  onChange={(event) =>
                    setTurnover((current) => ({
                      ...current,
                      days: event.target.value.replace(/\D/g, ''),
                    }))
                  }
                />
              </label>
            </div>
          </SettingCard>

          <SettingCard
            number="6"
            icon={BsCalendar2CheckFill}
            title="Кол-во дней до фиксации метрик"
            description="Только для Единых РК"
          >
            <div className={styles.fieldGroup}>
              <label className={styles.numberRow}>
                <span>Дней до фиксации</span>
                <input
                  type="text"
                  inputMode="numeric"
                  value={daysToFixing}
                  disabled={campaignType !== 'unified'}
                  className={
                    campaignType === 'unified' && Number(daysToFixing) <= 0
                      ? styles.inputInvalid
                      : ''
                  }
                  onChange={(event) =>
                    setDaysToFixing(event.target.value.replace(/\D/g, ''))
                  }
                />
              </label>
            </div>
          </SettingCard>

          <SettingCard
            number="7"
            icon={FaRegClock}
            title="Часы активности"
            description="Выберите расписание показов"
          >
            <div className={styles.hoursBlock}>
              <div className={styles.choiceGroup}>
                {[
                  [true, 'Круглосуточно'],
                  [false, 'По времени'],
                ].map(([value, label]) => (
                  <button
                    key={label}
                    type="button"
                    className={
                      allDayActivity === value ? styles.choiceActive : ''
                    }
                    onClick={() => setAllDayActivity(value)}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className={styles.hoursRow}>
                <label>
                  С
                  <select
                    value={activityHours.start}
                    disabled={allDayActivity}
                    onChange={(event) =>
                      setActivityHours((current) => ({
                        ...current,
                        start: event.target.value,
                      }))
                    }
                  >
                    {hours.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}:00
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  До
                  <select
                    value={activityHours.pause}
                    disabled={allDayActivity}
                    onChange={(event) =>
                      setActivityHours((current) => ({
                        ...current,
                        pause: event.target.value,
                      }))
                    }
                  >
                    {hours.map((hour) => (
                      <option key={hour} value={hour}>
                        {hour}:00
                      </option>
                    ))}
                  </select>
                </label>
              </div>
            </div>
          </SettingCard>
        </section>

        <section className={styles.articlesBlock}>
          <div className={styles.articlesHeading}>
            <div className={styles.articlesHeadingIcon}>
              <FaTshirt />
            </div>
            <div className={styles.articlesHeadingText}>
              <h2>Артикулы</h2>
              <p>Найдите товары вручную или загрузите список из файла</p>
            </div>
          </div>
          <div className={styles.articlePicker}>
            <h3 className={styles.subTitle}>Выбор артикула</h3>
            <div className={styles.searchActions}>
              <form
                className={styles.searchForm}
                onSubmit={(event) => {
                  event.preventDefault();
                  setSubmittedSearch(search);
                }}
              >
                <FiSearch />
                <input
                  value={search}
                  placeholder="SKU или vendorcode"
                  onChange={(event) => setSearch(event.target.value)}
                />
              </form>
              <button
                type="button"
                className={styles.excelButton}
                onClick={() => fileInputRef.current?.click()}
              >
                Загрузить xlsx-файл
              </button>
              <input
                ref={fileInputRef}
                className={styles.hiddenFileInput}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleExcelUpload}
              />
            </div>
            {excelMessage ? (
              <div className={styles.excelMessage}>{excelMessage}</div>
            ) : null}
            <div className={styles.searchBox}>
              {skusLoading ? (
                <div className={styles.searchResults}>
                  {Array.from({ length: 4 }, (_, index) => (
                    <span key={index} className={styles.skeletonSku} />
                  ))}
                </div>
              ) : skusError ? (
                <div className={styles.error}>{skusError}</div>
              ) : submittedSearch.trim() && searchResults.length === 0 ? (
                <div className={styles.empty}>
                  Артикул не найден или для него запущен AB-тест
                </div>
              ) : submittedSearch.trim() ? (
                <div className={styles.searchResults}>
                  {searchResults.map((item) => (
                    <SkuCard
                      key={item.sku}
                      item={item}
                      selected={selectedSkus.has(String(item.sku))}
                      onClick={() => toggleSku(item)}
                    />
                  ))}
                </div>
              ) : (
                <div className={styles.empty}>
                  Введите SKU или наименование артикула
                </div>
              )}
            </div>
          </div>

          <div className={styles.selectedBlock}>
            <div className={styles.selectedHeader}>
              <h3 className={styles.subTitle}>Выбранные артикулы</h3>
              <span className={styles.count}>{selectedItems.length}</span>
              <button
                type="button"
                className={styles.clearSelected}
                disabled={selectedItems.length === 0}
                onClick={clearSelected}
                title="Снять выделение со всех артикулов"
                aria-label="Снять выделение со всех артикулов"
              >
                <FiTrash2 />
              </button>
            </div>
            {selectedItems.length === 0 ? (
              <div className={styles.selectedGridWrap}>
                <div className={styles.selectedEmpty}>Артикулы пока не выбраны</div>
              </div>
            ) : (
              <div className={styles.selectedGridWrap}>
                <div className={styles.selectedGrid}>
                  {selectedItems.map((item) => (
                    <SkuCard
                      key={item.sku}
                      item={item}
                      selected
                      onClick={() => toggleSku(item)}
                      onRemove={() => toggleSku(item)}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </section>

        <section className={styles.validationBlock}>
          <div className={styles.summaryHeading}>
            <div className={styles.summaryHeadingIcon}>
              <FiInfo />
            </div>
            <div className={styles.summaryHeadingText}>
              <h2>Итоги настройки</h2>
              <p>Проверьте параметры перед запуском</p>
            </div>
          </div>
          <div className={styles.summaryRows}>
            <div><span>Тип кампании</span><strong>{campaignType === 'unified' ? 'Единая' : 'Ручная'}</strong></div>
            <div><span>Место размещения</span><strong>{placementSummary || '—'}</strong></div>
            <div><span>Стартовый бюджет</span><strong>{roundedBudget.start || '—'} ₽</strong></div>
            <div><span>Порог пополнения</span><strong>{roundedBudget.floor || '—'} ₽</strong></div>
            <div><span>Сумма пополнения</span><strong>{roundedBudget.replenishment || '—'} ₽</strong></div>
            <div><span>Порог показов для кластеров</span><strong>{campaignType === 'unified' ? clusterThresholds.views || '—' : '—'}</strong></div>
            <div><span>Порог CTR для кластеров</span><strong>{campaignType === 'unified' && clusterThresholds.ctr ? `${clusterThresholds.ctr}%` : '—'}</strong></div>
            <div>
              <span>Источник пополнения</span>
              <strong>
                {sourceType === 0
                  ? 'Счёт'
                  : sourceType === 3
                    ? 'Бонусы'
                    : 'Баланс'}
              </strong>
            </div>
            <div>
              <span>Кешбэк</span>
              <strong>
                {formatMoney(cashback.amount ?? cashback.sum ?? 0)} ₽ ({cashback.percent ?? 0}%)
              </strong>
            </div>
            <div><span>Проверка оборачиваемости</span><strong>{checkTurnover ? 'Вкл.' : 'Выкл.'}</strong></div>
            {checkTurnover ? (
              <>
                <div><span>Порог оборачиваемости</span><strong>{turnover.threshold || '—'} дней</strong></div>
                <div><span>Дней для расчета</span><strong>{turnover.days || '—'} дней</strong></div>
              </>
            ) : null}
            <div><span>Кол-во дней до фиксации метрик</span><strong>{campaignType === 'unified' ? `${daysToFixing || '—'} дней` : '—'}</strong></div>
            <div><span>Часы активности</span><strong>{allDayActivity ? 'Круглосуточно' : `${activityHours.start}:00 - ${activityHours.pause}:00`}</strong></div>
          </div>
          <div className={styles.summaryValidation}>
            <h3>Проверка настроек</h3>
            {settingErrors.length > 0 ? (
              <ul className={styles.validationErrors}>
                {settingErrors.map((error) => (
                  <li key={error}>{error}</li>
                ))}
              </ul>
            ) : (
              <div className={styles.noErrors}>Ошибок в настройках нет</div>
            )}
            <button
              type="button"
              className={styles.createButton}
              disabled={settingErrors.length > 0 || createLoading}
              onClick={handleCreateCampaign}
            >
              {createLoading ? 'Создаём…' : 'Создать РК'}
            </button>
            {createError ? (
              <div className={styles.createError}>{createError}</div>
            ) : null}
          </div>
        </section>
      </div>
    </div>
  );
};

export default PromoCreatePage;
