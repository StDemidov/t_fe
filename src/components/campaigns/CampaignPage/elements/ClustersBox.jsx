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
  fixed,
  fixedCtr,
  fixedAtc,
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
          fixed={fixed}
          fixedCtr={fixedCtr}
          fixedAtc={fixedAtc}
        />
      ) : (
        <div className={styles.emptyData}>Данных по кластерам пока нет</div>
      )}
    </div>
  );
};

export default ClustersBox;
