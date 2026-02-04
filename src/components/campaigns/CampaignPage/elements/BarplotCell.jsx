import { useState } from 'react';
import { calculateArraySum } from '../../../../utils/calculations';
import BarplotCampaign from './BarplotCampaign';
import styles from './style.module.css';

const BarplotCell = ({ data, style }) => {
  const total = calculateArraySum(data.data);
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
        {total === 0 ? '' : total}
      </div>
      <div
        className={`${styles.chartContainer} ${
          showSum && total !== 0 ? styles.dimmed : ''
        }`}
      >
        <BarplotCampaign data={data.data} dates={data.dates} small={true} />{' '}
      </div>
    </div>
  );
};

export default BarplotCell;
