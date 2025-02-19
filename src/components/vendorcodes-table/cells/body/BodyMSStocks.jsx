import styles from './style.module.css';
import { PiEmptyDuotone } from 'react-icons/pi';

const BodyMSStocks = ({ vc }) => {
  return (
    <div className={`${styles.cell} ${styles.cellMSStock}`}>
      {vc.msTotal === 0 ? <PiEmptyDuotone color="red" /> : vc.msTotal}
    </div>
  );
};

export default BodyMSStocks;
