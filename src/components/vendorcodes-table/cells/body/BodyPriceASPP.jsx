import styles from './style.module.css';
import { PiEmptyDuotone } from 'react-icons/pi';

const BodyPriceASPP = ({ vc }) => {
  return (
    <div className={`${styles.cell} ${styles.cellSPP}`}>
      {vc.lastPriceASpp === 0 ? (
        <PiEmptyDuotone color="red" />
      ) : (
        vc.lastPriceASpp
      )}{' '}
      {vc.lastPriceASpp === 0 ? '' : '₽'}
    </div>
  );
};

export default BodyPriceASPP;
