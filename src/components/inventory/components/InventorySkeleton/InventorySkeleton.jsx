import React from 'react';
import styles from './InventorySkeleton.module.css';

const Shimmer = ({ width, height, borderRadius = 6, style = {} }) => (
  <div className={styles.shimmer} style={{ width, height, borderRadius, flexShrink: 0, ...style }} />
);

const SkuRowSkeleton = () => (
  <div className={styles.skuRowSkeleton}>
    <div className={styles.cardSkeleton}>
      <div className={styles.cardHeader}>
        <Shimmer width="60%" height={13} />
        <div style={{ display: 'flex', gap: 5 }}>
          <Shimmer width={22} height={22} borderRadius={6} />
          <Shimmer width={22} height={22} borderRadius={6} />
        </div>
      </div>
      <div className={styles.cardBody}>
        <div className={styles.infoSkeleton}>
          <div className={styles.dateRowSkeleton}>
            <Shimmer width={75} height={11} />
            <Shimmer style={{ flex: 1, minWidth: 80 }} height={26} borderRadius={7} />
            <Shimmer width={34} height={26} borderRadius={7} />
          </div>
          <div className={styles.metricsGridSkeleton}>
            {[0,1,2,3].map(i => <Shimmer key={i} style={{ width: '100%' }} height={46} borderRadius={8} />)}
          </div>
          <div className={styles.chartsSkeleton}>
            {[0,1].map(i => (
              <div key={i} className={styles.chartSkeletonWrap}>
                <Shimmer width={50} height={9} />
                <Shimmer width={130} height={54} borderRadius={5} />
              </div>
            ))}
          </div>
        </div>
        <Shimmer width={150} style={{ alignSelf: 'stretch', marginRight: 12 }} borderRadius={10} />
      </div>
    </div>
    <div className={styles.ganttSkeleton}>
      {[0,1,2,3].map(row => (
        <div key={row} className={styles.ganttRowSkeleton}>
          <Shimmer width={52} height={26} borderRadius={3} />
          <Shimmer width={62} height={26} borderRadius={3} />
          <Shimmer width={68} height={26} borderRadius={3} />
          <Shimmer width={100} height={26} borderRadius={3} />
          {Array.from({ length: 26 }).map((_, i) => (
            <Shimmer key={i} width={40} height={26} borderRadius={3} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

const InventorySkeleton = () => (
  <div className={styles.skeleton}>
    <div className={styles.toolbarSkeleton}>
      <div className={styles.filtersRow}>
        {[140, 170, 110, 80, 70, 90, 170].map((w, i) => (
          <Shimmer key={i} width={w} height={30} borderRadius={8} />
        ))}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        {[130, 70, 110, 110].map((w, i) => <Shimmer key={i} width={w} height={30} borderRadius={8} />)}
      </div>
    </div>
    <div className={styles.paginatorSkeleton}>
      <Shimmer width={80} height={20} borderRadius={20} />
    </div>
    {[0,1,2,3].map(i => <SkuRowSkeleton key={i} />)}
  </div>
);

export default InventorySkeleton;
