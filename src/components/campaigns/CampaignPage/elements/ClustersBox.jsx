import ClusterRow from './clusters_table/ClusterRow';
import ClustersTable from './clusters_table/ClustersTable';
import styles from './style.module.css';

const ClustersBox = ({
  clusters,
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
