import styles from './style.module.css';
import { PiEmptyDuotone } from 'react-icons/pi';

const BodyPriceASPP = ({ vc }) => {
  return (
    <div className={`${styles.cell} ${styles.cellSPP}`}>
      <div>
        {vc.lastPriceASpp === 0 ? (
          <PiEmptyDuotone color="red" />
        ) : (
          vc.lastPriceASpp
        )}{' '}
        {vc.lastPriceASpp === 0 ? '' : '₽'}
      </div>
      <div className={styles.sppAmount}>
        {'  ('}
        {vc.sppAmount === 0
          ? vc.sppAmount
          : vc.sppAmount
          ? vc.sppAmount
          : '?'}{' '}
        {'%)'}
      </div>
    </div>
  );
};

export default BodyPriceASPP;
