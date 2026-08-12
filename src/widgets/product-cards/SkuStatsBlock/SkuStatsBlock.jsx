import styles from './SkuStatsBlock.module.css';

const campaignStatusClass = (status) => {
  if (status === 'Active') return styles.statusActive;
  if (status === 'Paused') return styles.statusPaused;
  return styles.statusNone;
};

/**
 * Блок статистики артикула: плашки кампаний (Авто/Аук — ссылки на кампании,
 * когда есть adId) и пять строк с показателями. Раскрывается по свойству open
 * единым плавным движением (always-mounted, без размонтирования).
 * Используется в карточке товара и в доке свободных товаров.
 * @param {object} props
 * @param {{ stats: object }} props.sku — артикул со статистикой в stats (см. getSkuStats)
 * @param {boolean} [props.open] — показывать ли блок
 */
const SkuStatsBlock = ({ sku, open }) => {
  const unified = sku.unifiedCampaign || {};
  const manual = sku.manualCampaign || {};

  const renderBadge = (label, status, adId) =>
    adId ? (
      <a
        href={`/tools/campaigns/${adId}`}
        target="_blank"
        rel="noopener noreferrer"
        className={`${styles.badge} ${styles.badgeLink} ${campaignStatusClass(
          status
        )}`}
      >
        {label}
      </a>
    ) : (
      <span className={`${styles.badge} ${campaignStatusClass(status)}`}>
        {label}
      </span>
    );

  const { stats } = sku;
  const fmt = (value) => value.toLocaleString('ru-RU');

  return (
    <div className={`${styles.block} ${open ? styles.open : ''}`}>
      <div className={styles.badges}>
        {renderBadge('Авто', unified.status, unified.adId)}
        {renderBadge('Аук', manual.status, manual.adId)}
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Остатки</span>
        <span className={styles.value}>{fmt(stats.stocks)}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Клики</span>
        <span className={styles.value}>{fmt(stats.clicks)}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>Заказы</span>
        <span className={styles.value}>{fmt(stats.orders)}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>РР</span>
        <span className={styles.value}>{fmt(stats.ads)}</span>
      </div>
      <div className={styles.row}>
        <span className={styles.label}>CR корз</span>
        <span className={styles.value}>
          {stats.crCart === null
            ? '—'
            : `${(stats.crCart * 100).toLocaleString('ru-RU', {
                maximumFractionDigits: 2,
              })}%`}
        </span>
      </div>
    </div>
  );
};

export default SkuStatsBlock;
