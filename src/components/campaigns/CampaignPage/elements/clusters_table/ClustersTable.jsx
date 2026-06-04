import { useEffect, useRef, useState } from 'react';
import ClusterRow from './ClusterRow';
import styles from './style.module.css';
import { useDispatch, useSelector } from 'react-redux';

import { TiArrowSortedUp } from 'react-icons/ti';
import { TiArrowSortedDown } from 'react-icons/ti';

import {
  editClusters,
  fixCampaign,
  selectCampById,
  selectClustersIsLoading,
  selectClustersSortingType,
  selectShowClustersDisabled,
  setClusterSortingType,
} from '../../../../../redux/slices/campaignsSlice';
import { hostName } from '../../../../../utils/host';
import { selectNotificationMessage } from '../../../../../redux/slices/notificationSlice';
import SortingButtons from './SortingButtons';
import DisabledFilter from './DisabledFilter';
import { selectUser } from '../../../../../redux/slices/authSlice';
import ConfirmModal from '../../../../confirm_modal/ConfirmModal';

const ClustersTable = ({
  clusters,
  totalViews,
  totalClicks,
  totalOrders,
  totalAddToCart,
  totalSpend,
  campId,
  fixedCtr,
  fixedAtc,
  fixed,
  unified = false,
}) => {
  const [changes, setChanges] = useState({});
  const containerRef = useRef(null);
  const [visibleCount, setVisibleCount] = useState(30);
  const clustersIsLoading = useSelector(selectClustersIsLoading);
  const notificationMessage = useSelector(selectNotificationMessage);
  const clustersSortingType = useSelector(selectClustersSortingType);
  const showDisabled = useSelector(selectShowClustersDisabled);
  const currentUser = useSelector(selectUser);
  const [modalData, setModalData] = useState({
    isOpen: false,
    text: '',
    onConfirm: null,
  });
  const [newFixed, setNewFixed] = useState(fixed);
  const dispatch = useDispatch();

  const openConfirmModal = (text, onConfirm) => {
    setModalData({
      isOpen: true,
      text,
      onConfirm: () => {
        onConfirm();
        setModalData({ ...modalData, isOpen: false });
      },
    });
  };

  const closeModal = () => {
    setModalData({ ...modalData, isOpen: false });
  };

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

    dispatch(
      editClusters({
        data: changes,
        url: `${hostName}/ad_camps/edit_clusters/${campId}`,
      })
    );
  };

  const handleClickOnFix = (e) => {
    e.stopPropagation();
    e.preventDefault();

    openConfirmModal(
      !fixed
        ? `Вы уверены, что хотите зафиксировать кластера?`
        : `Вы уверены, что хотите cнять фиксацию кластеров?`,
      (e) => {
        dispatch(fixCampaign(`${hostName}/ad_camps/fix/${campId}`));
        setNewFixed(!newFixed);
      }
    );
  };

  const handleClickOnApplyClusterSorting = (e) => {
    e.stopPropagation();
    e.preventDefault();

    dispatch(setClusterSortingType(e.currentTarget.getAttribute('data-value')));
  };

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          setVisibleCount((prev) => prev + 30);
        }
      },
      {
        root: containerRef.current,
        rootMargin: '200px',
      }
    );

    const el = document.getElementById('clusters-loader');
    if (el) observer.observe(el);

    return () => observer.disconnect();
  }, []);

  const filteredClusters = clusters.filter((item) => {
    let disabledMatch = true;
    if (!showDisabled) {
      disabledMatch = !item.disabled;
    }
    return disabledMatch;
  });
  const sortedClusters = [...filteredClusters];
  getSortedData(sortedClusters, clustersSortingType);

  return (
    <div className={styles.clustersTable}>
      <div className={styles.preHeader}>
        <div className={styles.fixedMetricsBox}>
          {fixedCtr && (
            <div className={styles.fixedMetric}>
              Фикс. CTR {(fixedCtr * 100).toFixed(2)} %
            </div>
          )}
          {fixedAtc && (
            <div className={styles.fixedMetric}>
              Фикс. CR {(fixedAtc * 100).toFixed(2)} %
            </div>
          )}
        </div>
        <div className={styles.applyClusterChanges}>
           
          <DisabledFilter />
          {(currentUser.permissions.ad_camps_manage ||
            currentUser.permissions.is_admin) &&
            !unified && (
              <button
                className={styles.fixButton}
                disabled={clustersIsLoading ? true : false}
                onClick={handleClickOnFix}
              >
                {newFixed ? 'Снять фиксацию' : 'Зафиксировать'}
              </button>
            )}
          {(currentUser.permissions.ad_camps_manage ||
            currentUser.permissions.is_admin) && (
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
          )}
        </div>
      </div>

      <div className={styles.clustersHeader}>
        <div className={styles.clusterName}>Кластер</div>
        <div className={styles.clusterActivity}>Активность</div>
        {unified ? <></> : <div className={styles.clusterBid}>Ставка</div>}
        <div className={styles.clusterViews}>
          <div>
            <div className={styles.headerCell}>
              Показы{' '}
              <SortingButtons
                ascSortingKey={'views asc'}
                descSortingKey={'views desc'}
                activeSorting={clustersSortingType}
                handler={handleClickOnApplyClusterSorting}
              />
            </div>
            <div className={styles.totalMetric}>{totalViews}</div>
          </div>
        </div>
        <div className={styles.clusterClicks}>
          <div>
            <div className={styles.headerCell}>
              Клики
              <SortingButtons
                ascSortingKey={'clicks asc'}
                descSortingKey={'clicks desc'}
                activeSorting={clustersSortingType}
                handler={handleClickOnApplyClusterSorting}
              />
            </div>
            <div className={styles.totalMetric}>{totalClicks}</div>
          </div>
        </div>
        <div className={styles.clusterOrders}>
          <div>
            <div className={styles.headerCell}>
              Заказы
              <SortingButtons
                ascSortingKey={'orders asc'}
                descSortingKey={'orders desc'}
                activeSorting={clustersSortingType}
                handler={handleClickOnApplyClusterSorting}
              />
            </div>
            <div className={styles.totalMetric}>{totalOrders}</div>
          </div>
        </div>
        <div className={styles.clusterToCarts}>
          <div>
            <div className={styles.headerCell}>
              В корзину{' '}
              <SortingButtons
                ascSortingKey={'toCart asc'}
                descSortingKey={'toCart desc'}
                activeSorting={clustersSortingType}
                handler={handleClickOnApplyClusterSorting}
              />
            </div>
            <div className={styles.totalMetric}>{totalAddToCart}</div>
          </div>
        </div>
        <div className={styles.clusterCTR}>
          <div>
            <div className={styles.headerCell}>
              CTR{' '}
              <SortingButtons
                ascSortingKey={'ctr asc'}
                descSortingKey={'ctr desc'}
                activeSorting={clustersSortingType}
                handler={handleClickOnApplyClusterSorting}
              />
            </div>
            <div className={styles.totalMetric}>
              {totalViews === 0
                ? '0 %'
                : `${((totalClicks / totalViews) * 100).toFixed(2)} %`}
            </div>
          </div>
        </div>
        <div className={styles.clusterPosition}>
          {' '}
          <div>
            <div className={styles.headerCell}>
              CR в корзину{' '}
              <SortingButtons
                ascSortingKey={'crToCart asc'}
                descSortingKey={'crToCart desc'}
                activeSorting={clustersSortingType}
                handler={handleClickOnApplyClusterSorting}
              />
            </div>
            <div className={styles.totalMetric}>
              {totalViews === 0
                ? '0 %'
                : `${((totalAddToCart / totalViews) * 100).toFixed(2)} %`}
            </div>
          </div>
        </div>
        <div className={styles.clusterViews}>
          <div>
            <div className={styles.headerCell}>
              Траты{' '}
              <SortingButtons
                ascSortingKey={'spend asc'}
                descSortingKey={'spend desc'}
                activeSorting={clustersSortingType}
                handler={handleClickOnApplyClusterSorting}
              />
            </div>
            <div className={styles.totalMetric}>{totalSpend.toFixed(0)}</div>
          </div>
        </div>
        {/* <div className={styles.clusterPosition}>Позиция</div> */}
      </div>

      <div ref={containerRef} className={styles.clustersRows}>
        {sortedClusters.slice(0, visibleCount).map((item) => {
          const patch = changes[item.id] || {};
          return (
            <ClusterRow
              key={item.id}
              cluster={{ ...item, ...patch }}
              onToggleDisabled={(value) =>
                updateField(item.id, 'disabled', value)
              }
              onChangeBid={(value) => updateField(item.id, 'bid', value)}
              unified={unified}
              totalSpend={totalSpend}
            />
          );
        })}
        <div id="clusters-loader" style={{ height: 20 }} />
      </div>
      <ConfirmModal
        isOpen={modalData.isOpen}
        text={modalData.text}
        onConfirm={modalData.onConfirm}
        onCancel={closeModal}
      />
    </div>
  );
};

export default ClustersTable;

const getSortedData = (data, selectedSorting) => {
  switch (selectedSorting) {
    case 'views desc':
      data.sort((a, b) => (a.views.total > b.views.total ? -1 : 1));
      break;
    case 'views asc':
      data.sort((a, b) => (a.views.total > b.views.total ? 1 : -1));
      break;
    case 'clicks desc':
      data.sort((a, b) => (a.clicks.total > b.clicks.total ? -1 : 1));
      break;
    case 'clicks asc':
      data.sort((a, b) => (a.clicks.total > b.clicks.total ? 1 : -1));
      break;
    case 'orders desc':
      data.sort((a, b) => (a.orders.total > b.orders.total ? -1 : 1));
      break;
    case 'orders asc':
      data.sort((a, b) => (a.orders.total > b.orders.total ? 1 : -1));
      break;
    case 'toCart desc':
      data.sort((a, b) => (a.toCart.total > b.toCart.total ? -1 : 1));
      break;
    case 'toCart asc':
      data.sort((a, b) => (a.toCart.total > b.toCart.total ? 1 : -1));
      break;
    case 'ctr desc':
      data.sort((a, b) => (a.ctrTotal > b.ctrTotal ? -1 : 1));
      break;
    case 'ctr asc':
      data.sort((a, b) => (a.ctrTotal > b.ctrTotal ? 1 : -1));
      break;
    case 'crToCart desc':
      data.sort((a, b) => (a.toCartCrTotal > b.toCartCrTotal ? -1 : 1));
      break;
    case 'crToCart asc':
      data.sort((a, b) => (a.toCartCrTotal > b.toCartCrTotal ? 1 : -1));
      break;
    case 'spend desc':
      data.sort((a, b) => (a.spend.total > b.spend.total ? -1 : 1));
      break;
    case 'spend asc':
      data.sort((a, b) => (a.spend.total > b.spend.total ? 1 : -1));
      break;
    default:
      data.sort((a, b) => (a.views.total > b.views.total ? -1 : 1));
  }
};
