import { GiDiamondTrophy } from 'react-icons/gi';
import { IoIosTrophy } from 'react-icons/io';

import styles from './style.module.css';

const SingleAbTestCompleted = ({ task }) => {
  let leaderUrl = '';
  let maxCtr = 0;
  for (const img of task?.images) {
    let ctr = (img?.clicks / img?.views) * 100;
    if (ctr > maxCtr) {
      maxCtr = ctr;
      leaderUrl = img?.url;
    }
  }
  return (
    <div className={styles.boxForBoxes}>
      <div className={styles.boxHeader}>{task?.name}</div>
      <div className={styles.boxImages}>
        <div className={styles.imageFrame} />
        {task?.images.map((img) => {
          return (
            <div
              className={styles.imageFrame}
              key={img?.url}
              style={{
                backgroundImage: `url(${img?.url})`,
              }}
            >
              {img?.url === leaderUrl && (
                <GiDiamondTrophy className={styles.animateRainbow} />
              )}
            </div>
          );
        })}

        <div className={styles.imageFrame} />
      </div>
      <div className={styles.boxMetrics}>
        <div className={styles.metricsFrameFirst}>
          <div className={styles.metricsCell}>Показов</div>
          <div className={styles.metricsCell}>Кликов</div>
          <div className={styles.metricsCell}>CTR (%)</div>
        </div>
        {task?.images.map((img) => {
          return (
            <div className={styles.metricsFrame} key={`metrics+${img?.url}`}>
              <div className={styles.metricsCell}>{img?.views}</div>
              <div className={styles.metricsCell}>{img?.clicks}</div>
              <div
                className={`${
                  (img?.clicks / img?.views) * 100 === maxCtr
                    ? styles.metricsCellBest
                    : styles.metricsCell
                }`}
              >
                {((img?.clicks / img?.views) * 100).toFixed(2)}
                {(img?.clicks / img?.views) * 100 === maxCtr ? (
                  <IoIosTrophy />
                ) : (
                  <span>{`(${(
                    ((img?.clicks / img?.views) * 100).toFixed(2) -
                    maxCtr.toFixed(2)
                  ).toFixed(2)} пп) `}</span>
                )}
              </div>
            </div>
          );
        })}
        <div className={styles.metricsFrameFirst} />
      </div>
    </div>
  );
};

export default SingleAbTestCompleted;
