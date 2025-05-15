import styles from './style.module.css';
import { PiEmptyDuotone } from 'react-icons/pi';

const BodyTurnoverBO = ({ vc }) => {
  return (
    <div className={styles.cell}>
      {vc.turnoverWBBuyout == 0 ? (
        <PiEmptyDuotone color="red" />
      ) : (
        vc.turnoverWBBuyout
      )}
    </div>
  );
};

export default BodyTurnoverBO;
