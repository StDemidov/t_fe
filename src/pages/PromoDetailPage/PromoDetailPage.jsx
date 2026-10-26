import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useSearchParams } from 'react-router-dom';
import { FaLock, FaLockOpen } from 'react-icons/fa';
import { FiSettings } from 'react-icons/fi';
import {
  DateRangePicker,
  LineChart,
  SortSelect,
  StackedBarChartComparison,
  SwitchFilter,
} from '../../shared/ui';
import {
  fetchPromoCampaign,
  fetchPromoClusters,
  fetchPromoLogs,
  updatePromoFixed,
  updatePromoClusters,
  getDefaultCampaignStartDate,
  getDefaultEndDate,
} from '../../entities/promo';
import { selectUser } from '../../redux/slices/authSlice';
import { setError } from '../../redux/slices/errorSlice';
import { setNotification } from '../../redux/slices/notificationSlice';
import StatusCell from '../../widgets/promo/PromoTable/StatusCell';
import PromoSettingsModal from '../../widgets/promo/PromoSettingsModal';
import '../../app/styles/global.css';
import styles from './PromoDetailPage.module.css';

const formatNumber = (value) => {
  if (value === null || value === undefined || value === '') return '—';
  const number = Number(value);
  return Number.isFinite(number)
    ? new Intl.NumberFormat('ru-RU', {
        maximumFractionDigits: 2,
      }).format(number)
    : String(value);
};

const formatDate = (value) => {
  if (!value) return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? String(value)
    : date.toLocaleDateString('ru-RU');
};

const toDateInput = (value) => {
  const match = String(value || '').match(/\d{4}-\d{2}-\d{2}/);
  return match ? match[0] : '';
};

const percent = (value) =>
  value === null || value === undefined ? '—' : `${formatNumber(value)}%`;

const ratioPercent = (numerator, denominator) => {
  const divisor = Number(denominator) || 0;
  return divisor ? percent(((Number(numerator) || 0) / divisor) * 100) : '—';
};

const BID_TYPE_LABELS = { manual: 'Ручная', unified: 'Единая' };

const subtractSeries = (total, part) => {
  const result = {};
  const dates = new Set([
    ...Object.keys(total || {}),
    ...Object.keys(part || {}),
  ]);
  dates.forEach((date) => {
    result[date] = (Number(total?.[date]) || 0) - (Number(part?.[date]) || 0);
  });
  return result;
};

const InfoRow = ({ label, value }) => (
  <div className={styles.infoRow}>
    <span className={styles.infoLabel}>{label}</span>
    <span className={styles.infoValue}>{value ?? '—'}</span>
  </div>
);

const MarqueeValue = ({ children, className = '' }) => (
  <MarqueeValueContent className={className}>{children}</MarqueeValueContent>
);

const MarqueeValueContent = ({ children, className = '' }) => {
  const wrapRef = useRef(null);
  const textRef = useRef(null);
  const [overflows, setOverflows] = useState(false);
  const [shift, setShift] = useState(0);

  useLayoutEffect(() => {
    const check = () => {
      const wrap = wrapRef.current;
      const text = textRef.current;
      if (!wrap || !text) return;
      const nextShift = Math.max(text.scrollWidth - wrap.clientWidth, 0);
      setShift(nextShift);
      setOverflows(nextShift > 0);
    };
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, [children]);

  return (
    <span
      ref={wrapRef}
      className={`${styles.marqueeValue} ${className} ${overflows ? styles.marqueeValueOverflow : ''}`}
      style={overflows ? { '--marquee-shift': `${shift}px` } : undefined}
    >
      <span ref={textRef} className={styles.marqueeValueText}>
        {children || '—'}
      </span>
    </span>
  );
};

const BadgeValue = ({ children, className = '' }) => (
  <span className={`${styles.valueBadge} ${className}`}>{children || '—'}</span>
);

const SettingValue = ({ children }) => (
  <strong className={styles.settingValue}>{children || '—'}</strong>
);

const ClusterName = ({ name }) => (
  <div className={styles.clusterName} title={name}>
    <span className={styles.clusterNameText}>{name || '—'}</span>
  </div>
);

const ClusterActivity = ({ disabled, canEdit, isFinished, onChange }) => (
  <label
    className={`${styles.switch} ${
      !canEdit || isFinished ? styles.switchDisabled : ''
    }`}
  >
    <input
      type="checkbox"
      checked={!disabled}
      disabled={!canEdit || isFinished}
      onChange={onChange}
    />
    <span className={styles.switchTrack} />
  </label>
);

const ClusterSkeleton = () => (
  <div className={styles.clusterSkeletonRow}>
    {Array.from({ length: 13 }, (_, index) => (
      <span key={index} className={styles.skeletonLine} />
    ))}
  </div>
);

const CampaignSkeleton = () => (
  <div className={styles.campaignSkeleton}>
    <div className={styles.campaignSkeletonTop}>
      <span className={styles.campaignSkeletonImage} />
      <span className={styles.campaignSkeletonCard} />
      <span className={styles.campaignSkeletonCard} />
      <span className={styles.campaignSkeletonMetrics} />
    </div>
    <div className={styles.campaignSkeletonCharts}>
      {Array.from({ length: 9 }, (_, index) => (
        <span key={index} className={styles.campaignSkeletonChart} />
      ))}
    </div>
  </div>
);

const LogsSkeleton = () => (
  <div className={styles.logsSkeleton}>
    {Array.from({ length: 7 }, (_, index) => (
      <div key={index} className={styles.logSkeletonRow}>
        <span />
        <span />
        <span />
      </div>
    ))}
  </div>
);

const AuthorName = ({ value }) => {
  const parts = String(value || 'soft').trim().split(/\s+/).filter(Boolean);
  const surname = parts.pop() || 'soft';

  return (
    <strong className={styles.logSurname}>{surname}</strong>
  );
};

const LogsPanel = ({ logs, isLoading }) => {
  const sortedLogs = [...logs].sort(
    (left, right) => new Date(right.date || 0) - new Date(left.date || 0)
  );

  return (
    <div className={styles.logsSection}>
      <h2 className={styles.logsTitle}>Логи РК</h2>
      {isLoading ? <LogsSkeleton /> : null}
      {!isLoading && sortedLogs.length === 0 ? (
        <div className={styles.logsEmpty}>Логов нет</div>
      ) : null}
      {!isLoading && sortedLogs.length > 0 ? (
        <div className={styles.logsList}>
          {sortedLogs.map((log, index) => (
            <div
              key={`${log.date || 'log'}-${index}`}
              className={styles.logRow}
            >
              <span className={styles.logDate}>{formatDate(log.date)}</span>
              <span className={styles.logText}>{log.text || '—'}</span>
              <span className={styles.logAuthor}>
                <AuthorName value={log.author || log.auhor || 'soft'} />
              </span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};

const ClusterCell = ({ value, share }) => (
  <div className={styles.clusterMetric}>
    <strong>{formatNumber(value)}</strong>
    <span>{percent(share)}</span>
  </div>
);

const SORT_OPTIONS = [
  { value: 'spend:desc', label: 'Траты' },
  { value: 'spend:asc', label: 'Траты' },
  { value: 'views:desc', label: 'Показы' },
  { value: 'views:asc', label: 'Показы' },
  { value: 'clicks:desc', label: 'Клики' },
  { value: 'clicks:asc', label: 'Клики' },
  {
    value: 'addingsToCart:desc',
    label: 'Добавления в корзину',
  },
  {
    value: 'addingsToCart:asc',
    label: 'Добавления в корзину',
  },
  { value: 'orders:desc', label: 'Заказы' },
  { value: 'orders:asc', label: 'Заказы' },
  { value: 'viewsShare:desc', label: 'Доля показов' },
  { value: 'viewsShare:asc', label: 'Доля показов' },
  { value: 'clicksShare:desc', label: 'Доля кликов' },
  { value: 'clicksShare:asc', label: 'Доля кликов' },
  {
    value: 'addingsToCartShare:desc',
    label: 'Доля добавлений',
  },
  {
    value: 'addingsToCartShare:asc',
    label: 'Доля добавлений',
  },
  { value: 'ordersShare:desc', label: 'Доля заказов' },
  { value: 'ordersShare:asc', label: 'Доля заказов' },
  { value: 'spendShare:desc', label: 'Доля трат' },
  { value: 'spendShare:asc', label: 'Доля трат' },
  { value: 'ctr:desc', label: 'CTR' },
  { value: 'ctr:asc', label: 'CTR' },
  { value: 'clickToCart:desc', label: 'Клик-корзина' },
  { value: 'clickToCart:asc', label: 'Клик-корзина' },
  { value: 'viewToCart:desc', label: 'Показ-корзина' },
  { value: 'viewToCart:asc', label: 'Показ-корзина' },
  { value: 'bid:desc', label: 'Ставка' },
  { value: 'bid:asc', label: 'Ставка' },
  {
    value: 'dateOfDiscovery:desc',
    label: 'Дата обнаружения',
  },
  {
    value: 'dateOfDiscovery:asc',
    label: 'Дата обнаружения',
  },
];

const getClusterSortValue = (cluster, key) => {
  if (key === 'dateOfDiscovery') {
    return new Date(cluster[key] || 0).getTime();
  }
  if (key === 'ctr') {
    return (Number(cluster.clicks) / Number(cluster.views)) * 100 || 0;
  }
  if (key === 'clickToCart') {
    return (Number(cluster.addingsToCart) / Number(cluster.clicks)) * 100 || 0;
  }
  if (key === 'viewToCart') {
    return (Number(cluster.addingsToCart) / Number(cluster.views)) * 100 || 0;
  }
  return Number(cluster[key]) || 0;
};

const ClusterTable = ({
  clusters,
  bidType,
  canEdit,
  canFix,
  isFixed,
  isFinished,
  campaignId,
  onFixedChange,
}) => {
  const [visibleCount, setVisibleCount] = useState(25);
  const [sortValue, setSortValue] = useState('spend:desc');
  const [showDisabled, setShowDisabled] = useState(true);
  const [localDisabled, setLocalDisabled] = useState({});
  const [committedDisabled, setCommittedDisabled] = useState({});
  const [localFixed, setLocalFixed] = useState({});
  const [fixConfirmOpen, setFixConfirmOpen] = useState(false);
  const [fixSaving, setFixSaving] = useState(false);
  const [applySaving, setApplySaving] = useState(false);
  const dispatch = useDispatch();
  const [sortKey, direction] = sortValue.split(':');
  const getDisabled = (cluster) =>
    localDisabled[cluster.id] ?? Boolean(cluster.disabled);
  const getFixed = (cluster) =>
    localFixed[cluster.id] ?? Boolean(cluster.fixedByUser);
  const displayedClusters = clusters
    .filter((cluster) => showDisabled || !getDisabled(cluster))
    .sort((left, right) => {
      const leftValue = getClusterSortValue(left, sortKey);
      const rightValue = getClusterSortValue(right, sortKey);
      return direction === 'asc'
        ? leftValue - rightValue
        : rightValue - leftValue;
    });
  const visibleClusters = displayedClusters.slice(0, visibleCount);

  useEffect(() => {
    setVisibleCount(25);
  }, [clusters.length, showDisabled, sortValue]);

  useEffect(() => {
    setLocalDisabled({});
    setCommittedDisabled({});
    setLocalFixed({});
  }, [clusters]);

  const changedClusters = clusters
    .filter(
      (cluster) =>
        localDisabled[cluster.id] !== undefined &&
        localDisabled[cluster.id] !==
          (committedDisabled[cluster.id] ?? Boolean(cluster.disabled))
    )
    .map((cluster) => ({
      id: cluster.id,
      disabled: localDisabled[cluster.id],
    }));

  const handleActivityChange = (cluster) => {
    const currentDisabled = getDisabled(cluster);
    const nextDisabled = !currentDisabled;
    setLocalDisabled((current) => ({
      ...current,
      [cluster.id]: nextDisabled,
    }));
  };

  const handleApplyChanges = async () => {
    if (changedClusters.length === 0) return;

    setApplySaving(true);
    try {
      const changes = changedClusters.map((cluster) => ({
        id: cluster.id,
        disabled: cluster.disabled,
      }));
      console.log('[advert/clusters_disabled] payload:', changes);
      await updatePromoClusters(changes);
      setCommittedDisabled((current) => {
        const next = { ...current };
        changedClusters.forEach((cluster) => {
          next[cluster.id] = cluster.disabled;
        });
        return next;
      });
      setLocalFixed((current) => {
        const next = { ...current };
        changedClusters.forEach((cluster) => {
          next[cluster.id] = true;
        });
        return next;
      });
      dispatch(setNotification('Изменения активности кластеров применены'));
    } catch (error) {
      dispatch(
        setError(error?.response?.data?.detail || 'Не удалось применить изменения кластеров')
      );
    } finally {
      setApplySaving(false);
    }
  };

  const handleFixedConfirm = async () => {
    setFixSaving(true);
    try {
      await onFixedChange(!isFixed);
      setLocalFixed(
        Object.fromEntries(
          clusters.map((cluster) => [cluster.id, !isFixed])
        )
      );
      setFixConfirmOpen(false);
    } finally {
      setFixSaving(false);
    }
  };

  const handleScroll = (event) => {
    const element = event.currentTarget;
    const nearBottom =
      element.scrollTop + element.clientHeight >= element.scrollHeight - 80;
    if (nearBottom && visibleCount < displayedClusters.length) {
      setVisibleCount((count) =>
        Math.min(count + 25, displayedClusters.length)
      );
    }
  };

  return (
    <>
      <div className={styles.clusterToolbar}>
        <SortSelect
          options={SORT_OPTIONS}
          value={sortValue}
          onChange={setSortValue}
        />
        <SwitchFilter
          label="Показывать отключенные"
          checked={showDisabled}
          onChange={setShowDisabled}
        />
        <div className={styles.clusterActions}>
          {canFix && bidType === 'manual' ? (
            <button
              type="button"
              className={styles.fixClustersButton}
              disabled={isFinished}
              onClick={() => setFixConfirmOpen(true)}
            >
              {isFixed ? 'Снять фиксацию' : 'Зафиксировать кластеры'}
            </button>
          ) : null}
          <button
            type="button"
            className={styles.applyClustersButton}
            disabled={
              !canEdit ||
              isFinished ||
              applySaving ||
              changedClusters.length === 0
            }
            onClick={handleApplyChanges}
          >
            Применить изменения
          </button>
        </div>
      </div>
      <div className={styles.clusterTableWrap} onScroll={handleScroll}>
        <table className={styles.clusterTable}>
          <thead>
            <tr>
              <th>Кластер</th>
              <th>Ставка</th>
              <th>Активность</th>
              <th>Дата обнаружения</th>
              <th>Фиксация</th>
              <th>Показы</th>
              <th>Клики</th>
              <th>Добавления в корзину</th>
              <th>Заказы</th>
              <th>Траты</th>
              <th>CTR</th>
              <th>Клик-корзина</th>
              <th>Показ-корзина</th>
            </tr>
          </thead>
          <tbody>
            {visibleClusters.map((cluster) => (
              <tr key={cluster.id}>
                <td className={styles.clusterNameCell}>
                  <ClusterName name={cluster.name} />
                </td>
                <td>
                  {bidType === 'manual' ? (
                    <input
                      className={styles.bidInput}
                      type="number"
                      min="1"
                      step="1"
                      inputMode="numeric"
                      pattern="[0-9]*"
                      value={cluster.bid ?? ''}
                      disabled
                      readOnly
                    />
                  ) : (
                    <span className={styles.notAvailable}>—</span>
                  )}
                </td>
                <td>
                  <ClusterActivity
                    disabled={getDisabled(cluster)}
                    canEdit={canEdit}
                    isFinished={isFinished}
                    onChange={() => handleActivityChange(cluster)}
                  />
                </td>
                <td>{formatDate(cluster.dateOfDiscovery)}</td>
                <td className={styles.fixationCell}>
                {getFixed(cluster) ? <FaLock /> : <FaLockOpen />}
                </td>
                <td>
                  <ClusterCell
                    value={cluster.views}
                    share={cluster.viewsShare}
                  />
                </td>
                <td>
                  <ClusterCell
                    value={cluster.clicks}
                    share={cluster.clicksShare}
                  />
                </td>
                <td>
                  <ClusterCell
                    value={cluster.addingsToCart}
                    share={cluster.addingsToCartShare}
                  />
                </td>
                <td>
                  <ClusterCell
                    value={cluster.orders}
                    share={cluster.ordersShare}
                  />
                </td>
                <td>
                  <ClusterCell
                    value={cluster.spend}
                    share={cluster.spendShare}
                  />
                </td>
                <td>
                  <span className={styles.clusterRatio}>
                    {ratioPercent(cluster.clicks, cluster.views)}
                  </span>
                </td>
                <td>
                  <span className={styles.clusterRatio}>
                    {ratioPercent(cluster.addingsToCart, cluster.clicks)}
                  </span>
                </td>
                <td>
                  <span className={styles.clusterRatio}>
                    {ratioPercent(cluster.addingsToCart, cluster.views)}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {fixConfirmOpen ? (
        <div className={styles.modalOverlay}>
          <div className={styles.confirmModal} role="dialog" aria-modal="true">
            <h2 className={styles.confirmTitle}>Подтвердите действие</h2>
            <p className={styles.confirmText}>
              {isFixed
                ? 'Снять фиксацию кластеров?'
                : 'Зафиксировать кластеры?'}
            </p>
            <div className={styles.confirmActions}>
              <button
                type="button"
                className={styles.cancelButton}
                disabled={fixSaving}
                onClick={() => setFixConfirmOpen(false)}
              >
                Отмена
              </button>
              <button
                type="button"
                className={styles.confirmButton}
                disabled={fixSaving}
                onClick={handleFixedConfirm}
              >
                {fixSaving ? 'Сохранение...' : 'Подтвердить'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
};

const MetricCard = ({ title, value, suffix = '' }) => (
  <div className={`card ${styles.metricCard}`}>
    <span className={styles.cardTitle}>{title}</span>
    <strong className={styles.metricValue}>
      {formatNumber(value)}
      {suffix}
    </strong>
  </div>
);

const PromoDetailPage = () => {
  const { id } = useParams();
  const [searchParams] = useSearchParams();
  const currentUser = useSelector(selectUser);
  const completionDate = toDateInput(searchParams.get('end_date'));
  const defaultEndDate = completionDate || getDefaultEndDate();
  const [range, setRange] = useState(() => ({
    startDate: getDefaultCampaignStartDate(defaultEndDate),
    endDate: defaultEndDate,
  }));
  const [campaign, setCampaign] = useState(null);
  const [campaignFixed, setCampaignFixed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [clusters, setClusters] = useState([]);
  const [clustersLoading, setClustersLoading] = useState(true);
  const [clustersError, setClustersError] = useState('');
  const [logs, setLogs] = useState([]);
  const [logsLoading, setLogsLoading] = useState(true);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const baseInfoRef = useRef(null);
  const [toolbarProductVisible, setToolbarProductVisible] = useState(false);
  const [toolbarProductMounted, setToolbarProductMounted] = useState(false);
  const [toolbarProductShown, setToolbarProductShown] = useState(false);
  const toolbarHideTimerRef = useRef(null);
  const canEditClusters = Boolean(
    currentUser?.permissions?.ad_camps_manage ||
      currentUser?.permissions?.is_admin
  );
  const canFixClusters = Boolean(
    currentUser?.permissions?.ad_camps_manage ||
      currentUser?.permissions?.is_admin
  );
  const isFinished = Number(campaign?.status) === 12;

  useEffect(() => {
    let active = true;
    setIsLoading(true);
    setError('');
    fetchPromoCampaign({ id, ...range })
      .then((data) => {
        if (!active) return;
        setCampaign(data);
        setCampaignFixed(Boolean(data.isFixed));

        const responseEndDate = toDateInput(data.endDatetime);
        if (
          !completionDate &&
          responseEndDate &&
          responseEndDate !== range.endDate
        ) {
          setRange({
            startDate: getDefaultCampaignStartDate(responseEndDate),
            endDate: responseEndDate,
          });
        }
      })
      .catch(() => {
        if (active) {
          setError('Не удалось загрузить данные рекламной кампании');
        }
      })
      .finally(() => {
        if (active) setIsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [completionDate, id, range]);

  useEffect(() => {
    let active = true;
    setClustersLoading(true);
    setClustersError('');
    fetchPromoClusters({ id })
      .then((data) => {
        if (active) setClusters(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setClustersError('Не удалось загрузить кластеры РК');
      })
      .finally(() => {
        if (active) setClustersLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id]);

  useEffect(() => {
    let active = true;
    setLogsLoading(true);
    fetchPromoLogs({ id, ...range })
      .then((data) => {
        if (active) setLogs(Array.isArray(data) ? data : []);
      })
      .catch(() => {
        if (active) setLogs([]);
      })
      .finally(() => {
        if (active) setLogsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [id, range]);

  useEffect(() => {
    const checkBaseInfo = () => {
      const element = baseInfoRef.current;
      setToolbarProductVisible(
        Boolean(element && element.getBoundingClientRect().bottom < 0)
      );
    };
    checkBaseInfo();
    window.addEventListener('scroll', checkBaseInfo, { passive: true });
    window.addEventListener('resize', checkBaseInfo);
    return () => {
      window.removeEventListener('scroll', checkBaseInfo);
      window.removeEventListener('resize', checkBaseInfo);
    };
  }, [campaign]);

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

  const metrics = campaign?.metrics || {};
  const handleFixedChange = async (nextIsFixed) => {
    await updatePromoFixed({
      id,
      isFixed: nextIsFixed,
    });
    setCampaignFixed(nextIsFixed);
    setCampaign((current) =>
      current ? { ...current, isFixed: nextIsFixed } : current
    );
  };

  const handleSettingsSaved = async () => {
    try {
      const data = await fetchPromoCampaign({ id, ...range });
      setCampaign(data);
      setCampaignFixed(Boolean(data.isFixed));
    } catch {
      // Уведомление об успешном сохранении уже показала модалка.
    }
  };
  const directOrders = subtractSeries(metrics.orders, metrics.assocOrders);
  const directAddings = subtractSeries(
    metrics.addingsToCart,
    metrics.assocAddingsToCart
  );
  const directOrdersPrice = subtractSeries(
    metrics.ordersPrice,
    metrics.assocOrdersPrice
  );
  const charts = [
    {
      title: 'Просмотры',
      datasets: [
        {
          name: 'Просмотры',
          data: metrics.views,
          summary: metrics.viewsSum,
          color: '#7c5ce8',
        },
      ],
    },
    {
      title: 'Клики',
      datasets: [
        {
          name: 'Клики',
          data: metrics.clicks,
          summary: metrics.clicksSum,
          color: '#00bfa6',
        },
      ],
    },
    {
      title: 'Расходы',
      datasets: [
        {
          name: 'Расходы',
          data: metrics.spend,
          summary: metrics.spendSum,
          color: '#7c5ce8',
        },
      ],
    },
    {
      title: 'Заказы',
      datasets: [
        {
          name: 'Прямые',
          data: directOrders,
          summary: (metrics.ordersSum || 0) - (metrics.assocOrdersSum || 0),
          color: '#7c5ce8',
        },
        {
          name: 'Ассоц.',
          data: metrics.assocOrders,
          summary: metrics.assocOrdersSum,
          color: '#00bfa6',
        },
      ],
    },
    {
      title: 'Добавления в корзину',
      datasets: [
        {
          name: 'Прямые',
          data: directAddings,
          summary:
            (metrics.addingsToCartSum || 0) -
            (metrics.assocAddingsToCartSum || 0),
          color: '#7c5ce8',
        },
        {
          name: 'Ассоц.',
          data: metrics.assocAddingsToCart,
          summary: metrics.assocAddingsToCartSum,
          color: '#00bfa6',
        },
      ],
    },
    {
      title: 'Стоимость заказов',
      datasets: [
        {
          name: 'Прямые',
          data: directOrdersPrice,
          summary:
            (metrics.ordersPriceSum || 0) - (metrics.assocOrdersPriceSum || 0),
          color: '#7c5ce8',
        },
        {
          name: 'Ассоц.',
          data: metrics.assocOrdersPrice,
          summary: metrics.assocOrdersPriceSum,
          color: '#00bfa6',
        },
      ],
    },
    {
      title: 'CTR',
      type: 'line',
      data: metrics.ctr,
      summary: percent(metrics.ctrTotal),
      color: '#7c5ce8',
    },
    {
      title: 'Клик → корзина',
      type: 'line',
      data: metrics.clickToCart,
      summary: percent(metrics.clickToCartTotal),
      color: '#7c5ce8',
    },
    {
      title: 'Просмотр → корзина',
      type: 'line',
      data: metrics.viewToCart,
      summary: percent(metrics.viewToCartTotal),
      color: '#7c5ce8',
    },
  ];

  const handleRangeChange = (nextRange) => setRange(nextRange);

  return (
    <div className={`page ${styles.root}`}>
      <header className={styles.header}>
        <h1 className="pageTitle">{campaign?.name || `Кампания #${id}`}</h1>
      </header>

      <div className={styles.toolbar}>
        <DateRangePicker
          value={range}
          onChange={handleRangeChange}
          maxDate={defaultEndDate}
        />
        {toolbarProductMounted && campaign && (
          <div
            className={`${styles.toolbarProduct} ${
              toolbarProductShown ? styles.toolbarProductVisible : ''
            }`}
          >
            {campaign.image ? (
              <img
                className={styles.toolbarPhoto}
                src={campaign.image}
                alt={campaign.vendorcode || campaign.name}
              />
            ) : null}
            <span className={styles.toolbarVendor}>
              {campaign.vendorcode || campaign.name || '—'}
            </span>
          </div>
        )}
      </div>

      {isLoading && <CampaignSkeleton />}
      {error && <div className={`card ${styles.error}`}>{error}</div>}

      {campaign && !isLoading && (
        <>
          <div ref={baseInfoRef} className={styles.topGrid}>
            <div className={styles.productCard}>
              {campaign.image ? (
                <img
                  className={styles.image}
                  src={campaign.image}
                  alt={campaign.vendorcode || campaign.name}
                />
              ) : (
                <div className={styles.noImage}>?</div>
              )}
            </div>
            <div className={`card ${styles.infoCard}`}>
              <div className={styles.badges}>
                {campaign.category && (
                  <span className={`${styles.badge} ${styles.badgeCategory}`}>
                    {campaign.category}
                  </span>
                )}
                {campaign.pattern && (
                  <span className={`${styles.badge} ${styles.badgePattern}`}>
                    {campaign.pattern}
                  </span>
                )}
                {campaign.country && (
                  <span className={`${styles.badge} ${styles.badgeCountry}`}>
                    {campaign.country}
                  </span>
                )}
              </div>
              <InfoRow
                label="Артикул"
                value={
                  <MarqueeValue className={styles.articleValue}>
                    {campaign.vendorcode || '—'}
                  </MarqueeValue>
                }
              />
              <InfoRow
                label="Название РК"
                value={<MarqueeValue>{campaign.name}</MarqueeValue>}
              />
              <InfoRow
                label="ID РК"
                value={<BadgeValue>{campaign.wbCampId}</BadgeValue>}
              />
              <InfoRow
                label="SKU"
                value={<BadgeValue>{campaign.sku}</BadgeValue>}
              />
              <InfoRow
                label="Тип кампании"
                value={
                  <BadgeValue className={styles.campaignTypeBadge}>
                    {BID_TYPE_LABELS[campaign.bidType] || campaign.bidType}
                  </BadgeValue>
                }
              />
              <InfoRow label="Статус" value={<StatusCell item={campaign} />} />
              <InfoRow
                label="Дата старта"
                value={formatDate(campaign.creationDatetime)}
              />
              <InfoRow
                label="Дата завершения"
                value={formatDate(campaign.endDatetime)}
              />
            </div>
            <div className={`card ${styles.infoCard} ${styles.settingsCard}`}>
              <div className={styles.sectionHeader}>
                <h2 className={styles.sectionTitle}>Настройки РК</h2>
                {canEditClusters && !isFinished && Number(campaign.status) !== 213 ? (
                  <button
                    type="button"
                    className={styles.settingsButton}
                    title="Настройки"
                    aria-label="Настройки"
                    onClick={() => setSettingsOpen(true)}
                  >
                    <FiSettings />
                  </button>
                ) : null}
              </div>
              <InfoRow
                label="Бюджет"
                value={
                  <SettingValue>{formatNumber(campaign.budget)}</SettingValue>
                }
              />
              <InfoRow
                label="Порог бюджета"
                value={
                  <SettingValue>
                    {formatNumber(campaign.budgetFloor)}
                  </SettingValue>
                }
              />
              <InfoRow
                label="Пополнять на"
                value={
                  <SettingValue>
                    {formatNumber(campaign.replinishmentAmount)}
                  </SettingValue>
                }
              />
              <InfoRow
                label="Ставка поиска"
                value={
                  <SettingValue>
                    {formatNumber(campaign.searchBid)}
                  </SettingValue>
                }
              />
              <InfoRow
                label="Ставка рекомендаций"
                value={
                  <SettingValue>{formatNumber(campaign.recBid)}</SettingValue>
                }
              />
              <InfoRow
                label="Активные часы"
                value={
                  <SettingValue>
                    {campaign.hasActiveHours
                      ? `${campaign.startHour}:00 - ${campaign.pauseHour}:00`
                      : 'Выключены'}
                  </SettingValue>
                }
              />
              <InfoRow
                label="Оборачиваемость"
                value={
                  <SettingValue>
                    {campaign.turnoverByBarcodes
                      ? 'По размерам'
                      : 'По артикулам'}
                  </SettingValue>
                }
              />
              <InfoRow
                label="Порог оборачиваемости"
                value={
                  <SettingValue>
                    {formatNumber(campaign.lowerTurnoverThreshold)}
                  </SettingValue>
                }
              />
              <InfoRow
                label="Кол-во дней"
                value={
                  <SettingValue>
                    {formatNumber(campaign.turnoverDays)}
                  </SettingValue>
                }
              />
              <InfoRow
                label="Дней до фиксации"
                value={
                  <SettingValue>
                    {campaign.bidType === 'unified'
                      ? formatNumber(campaign.daysToFixingMetrics)
                      : '—'}
                  </SettingValue>
                }
              />
            </div>
            <div className={styles.metricsGrid}>
              <MetricCard title="Расходы" value={metrics.spendSum} />
              <MetricCard title="Заказы" value={metrics.ordersSum} />
              <MetricCard
                title="Выручка заказов"
                value={metrics.ordersPriceSum}
              />
              <MetricCard title="CTR" value={metrics.ctrTotal} suffix="%" />
              <MetricCard
                title="Клик → корзина"
                value={metrics.clickToCartTotal}
                suffix="%"
              />
              <MetricCard
                title="Просмотр → корзина"
                value={metrics.viewToCartTotal}
                suffix="%"
              />
            </div>
          </div>

          <div className={styles.analyticsGrid}>
            <div className={styles.chartsGrid}>
              {charts.map(({ title, datasets, type, data, summary, color }) => (
                <div key={title} className={`card ${styles.chartCard}`}>
                  <span className={styles.cardTitle}>{title}</span>
                  {type === 'line' ? (
                    <LineChart
                      data={data || {}}
                      summary={summary}
                      color={color}
                      height={130}
                    />
                  ) : (
                    <StackedBarChartComparison
                      datasets={datasets}
                      height={130}
                    />
                  )}
                </div>
              ))}
            </div>
            <LogsPanel logs={logs} isLoading={logsLoading} />
          </div>
        </>
      )}

      <section className={styles.clustersSection}>
        <h2 className={styles.clustersTitle}>Кластеры</h2>
        {clustersLoading && (
          <div className={styles.clusterSkeleton}>
            {Array.from({ length: 8 }, (_, index) => (
              <ClusterSkeleton key={index} />
            ))}
          </div>
        )}
        {clustersError && <div className={styles.error}>{clustersError}</div>}
        {!clustersLoading && !clustersError && clusters.length === 0 && (
          <div className={styles.emptyClusters}>Нет данных по кластерам</div>
        )}
        {!clustersLoading && !clustersError && clusters.length > 0 && (
          <ClusterTable
            clusters={clusters}
            bidType={campaign?.bidType}
            canEdit={canEditClusters}
            canFix={canFixClusters}
            isFixed={campaignFixed}
            isFinished={isFinished}
            onFixedChange={handleFixedChange}
          />
        )}
      </section>
      {settingsOpen && campaign ? (
        <PromoSettingsModal
          campaign={campaign}
          onClose={() => setSettingsOpen(false)}
          onSaved={handleSettingsSaved}
        />
      ) : null}
    </div>
  );
};

export default PromoDetailPage;
