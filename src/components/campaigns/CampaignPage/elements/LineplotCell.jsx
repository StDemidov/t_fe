import { useState } from 'react';
import styles from './style.module.css';
import LineplotCampaign from './LineplotCampaign';

const LineplotCell = ({ data, style, ctrTotal = null }) => {
  const [showSum, setShowSum] = useState(true);
  return (
    <div
      className={style}
      onMouseEnter={() => setShowSum(false)}
      onMouseLeave={() => setShowSum(true)}
      style={{ position: 'relative' }}
    >
      <div
        className={`${styles.sumOverlay} ${
          showSum ? styles.visible : styles.hidden
        }`}
        style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          zIndex: 1000,
        }}
      >
        {ctrTotal === 0 ? '' : ctrTotal}
      </div>
      <div
        className={`${styles.chartContainer} ${
          showSum && ctrTotal !== 0 ? styles.dimmed : ''
        }`}
      >
        <LineplotCampaign data={data.data} dates={data.dates} small={true} />{' '}
      </div>
    </div>
  );
};

export default LineplotCell;
