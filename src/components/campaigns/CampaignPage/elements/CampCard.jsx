import { useDispatch } from 'react-redux';
import styles from './style.module.css';
import { setNotification } from '../../../../redux/slices/notificationSlice';
import StatusTag from '../../CampaignsTable/elements/CampaignsBody/cells/elements/StatusTag';
import StatusTagFlexible from './StatusTagFlexible';
import { getDate } from '../../../../utils/beaty';

const CampCard = ({ camp }) => {
  const dispatch = useDispatch();
  const handleCopy = (event) => {
    event.stopPropagation(); // Останавливаем всплытие
    event.preventDefault(); // Предотвращаем переход по ссылке (если нужно)

    navigator.clipboard.writeText(
      event.currentTarget.getAttribute('data-value')
    );
    dispatch(setNotification('Скопировано'));
  };

  const formattedDate = getDate(camp.stats.creationDate, true);
  const formattedEndDate = camp.stats.creationDate
    ? getDate(camp.stats.endDate, true)
    : null;

  const formattedStatsUpdate = getDate(camp.lastUpdateStats);

  const formattedClustersUpdate = getDate(camp.lastUpdateClusters);

  return (
    <div className={styles.campCard}>
      <div
        className={styles.photo}
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0), rgba(114, 114, 114, 0)), url(${camp.photo})`,
          cursor: 'pointer',
        }}
      ></div>
      <div className={styles.baseInfo}>
        <div className={styles.headerRow}>
          <div className={styles.campName}>{camp.stats.name}</div>
          <div className={styles.status}>
            <StatusTagFlexible camp={camp.stats} />
          </div>
        </div>

        <div className={styles.ids}>
          <div
            className={styles.idTag}
            data-value={camp.stats.sku}
            onClick={handleCopy}
          >
            SKU: <b>{camp.stats.sku}</b>
          </div>
          <div
            className={styles.idTag}
            data-value={camp.stats.campId}
            onClick={handleCopy}
          >
            ID PK: <b>{camp.stats.campId}</b>
          </div>
          <div
            className={styles.idTag}
            data-value={camp.stats.name.split('-')[1]}
            onClick={handleCopy}
          >
            Артикул: <b>{camp.stats.name.split('-')[1]}</b>
          </div>
        </div>
        <div className={styles.dates}>
          <div className={styles.date}>
            Дата создания: <b>{formattedDate}</b>
          </div>
          {camp.stats.endDate ? (
            <>
              <div className={styles.date}>
                Дата завершения: <b>{formattedEndDate}</b>
              </div>
            </>
          ) : (
            <>
              <div className={styles.date}>
                Статистика обновлена: <b>{formattedStatsUpdate}</b>
              </div>
              <div className={styles.date}>
                Кластеры обновлены: <b>{formattedClustersUpdate}</b>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default CampCard;
