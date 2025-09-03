import { IoCheckmarkCircle } from 'react-icons/io5';

import TestingAnimation from '../../testing_animation/TestingAnimation';

import styles from './style.module.css';

const SingleAbTestActive = ({ task }) => {
  return (
    <div className={styles.boxForBoxes}>
      <div className={styles.boxHeader}>{task?.name}</div>
      <div className={styles.boxImages}>
        <div className={styles.imageFrame} />
        {task?.images.map((img) => {
          return (
            <div
              className={styles.imageFrame}
              key={img.url}
              style={{
                backgroundImage: `${
                  img?.isTested
                    ? 'linear-gradient(rgba(37, 255, 44, 0.48), rgba(93, 50, 212, 0.2))'
                    : 'linear-gradient(rgba(255, 219, 13, 0.48), rgba(255, 255, 255, 0.48))'
                }, url(${img.url})`,
              }}
            >
              {img?.isTesting && <TestingAnimation />}
              {img?.isTested && <IoCheckmarkCircle color="green" />}
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
              <div className={styles.metricsCell}>
                {isNaN(((img?.clicks / img?.views) * 100).toFixed(2))
                  ? 0
                  : ((img?.clicks / img?.views) * 100).toFixed(2)}
              </div>
            </div>
          );
        })}
        <div className={styles.metricsFrameFirst} />
      </div>
    </div>
  );
};

export default SingleAbTestActive;
