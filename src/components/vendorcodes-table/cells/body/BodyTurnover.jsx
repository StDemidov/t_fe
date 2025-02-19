import styles from './style.module.css';
import { PiEmptyDuotone } from 'react-icons/pi';

const BodyTurnover = ({ vc }) => {
  return (
    <div className={styles.cell}>
      {vc.turnoverWB === 0 ? <PiEmptyDuotone color="red" /> : vc.turnoverWB}
    </div>
  );
};

export default BodyTurnover;
