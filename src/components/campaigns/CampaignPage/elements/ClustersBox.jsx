import ClusterRow from './clusters_table/ClusterRow';
import ClustersTable from './clusters_table/ClustersTable';
import styles from './style.module.css';

const ClustersBox = ({
  clusters,
  totalViews,
  totalClicks,
  totalOrders,
  totalAddToCart,
  totalSpend,
  dates,
  lastUpdateClusters,
  campId,
  unified = false,
}) => {
  return (
    <div className={styles.clustersBox}>
      {clusters.length > 0 ? (
        <ClustersTable
          clusters={clusters}
          totalViews={totalViews}
          totalClicks={totalClicks}
          totalOrders={totalOrders}
          totalAddToCart={totalAddToCart}
          totalSpend={totalSpend}
          dates={dates}
          lastUpdateClusters={lastUpdateClusters}
          campId={campId}
          unified={unified}
        />
      ) : (
        <div className={styles.emptyData}>Данных по кластерам пока нет</div>
      )}
    </div>
  );
};

export default ClustersBox;
