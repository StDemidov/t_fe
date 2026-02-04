import { useEffect, useState } from 'react';
import ClusterRow from './ClusterRow';
import styles from './style.module.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  editClusters,
  selectClustersIsLoading,
} from '../../../../../redux/slices/campaignsSlice';
import { hostName } from '../../../../../utils/host';
import { selectNotificationMessage } from '../../../../../redux/slices/notificationSlice';

const ClustersTable = ({
  clusters,
  dates,
  lastUpdateClusters,
  campId,
  unified = false,
}) => {
  const [changes, setChanges] = useState({});
  const clustersIsLoading = useSelector(selectClustersIsLoading);
  const notificationMessage = useSelector(selectNotificationMessage);
  const dispatch = useDispatch();

  useEffect(() => {
    if (notificationMessage === 'Изменения применены!') {
      setChanges({});
    }
  }, [notificationMessage]);

  const updateField = (id, field, value) => {
    setChanges((prev) => {
      const original = clusters.find((c) => c.id === id)[field];
      const isSame = original === value;

      const next = { ...prev };

      if (isSame) {
        // затираем изменение
        if (next[id]) {
          delete next[id][field];
          if (Object.keys(next[id]).length === 0) {
            delete next[id];
          }
        }
      } else {
        next[id] = {
          ...next[id],
          [field]: value,
        };
      }

      return next;
    });
  };

  const handleClickOnApply = (e) => {
    e.stopPropagation();
    e.preventDefault();
    // console.log(changes);
    dispatch(
      editClusters({
        data: changes,
        url: `${hostName}/ad_camps/edit_clusters/${campId}`,
      })
    );
  };

  return (
    <div className={styles.clustersTable}>
      <div className={styles.applyClusterChanges}>
        <button
          className={
            Object.keys(changes).length === 0 || clustersIsLoading
              ? styles.disabledButton
              : styles.applyButton
          }
          disabled={
            Object.keys(changes).length === 0 || clustersIsLoading
              ? true
              : false
          }
          onClick={handleClickOnApply}
        >
          {clustersIsLoading ? 'В процессе' : 'Применить изменения'}
        </button>
      </div>

      <div className={styles.clustersHeader}>
        <div className={styles.clusterName}>Кластер</div>
        <div className={styles.clusterActivity}>Активность</div>
        {unified ? <></> : <div className={styles.clusterBid}>Ставка</div>}
        <div className={styles.clusterViews}>Показы</div>
        <div className={styles.clusterClicks}>Клики</div>
        <div className={styles.clusterOrders}>Заказы</div>
        <div className={styles.clusterCTR}>CTR</div>
        <div className={styles.clusterToCarts}>В корзину</div>
        <div className={styles.clusterPosition}>Позиция</div>
      </div>

      <div className={styles.clustersRows}>
        {clusters.map((item) => {
          const patch = changes[item.id] || {};

          return (
            <ClusterRow
              key={item.id}
              cluster={{ ...item, ...patch }}
              onToggleDisabled={(value) =>
                updateField(item.id, 'disabled', value)
              }
              onChangeBid={(value) => updateField(item.id, 'bid', value)}
              dates={dates}
              lastUpdateClusters={lastUpdateClusters}
              unified={unified}
            />
          );
        })}
      </div>
    </div>
  );
};

export default ClustersTable;
