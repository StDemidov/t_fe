import styles from './style.module.css';
import { PiEmptyDuotone } from 'react-icons/pi';
import { RiDiscountPercentLine } from 'react-icons/ri';
import { MdCurrencyRuble } from 'react-icons/md';

const BodyPriceASPP = ({ vc }) => {
  return (
    <div className={`${styles.cell} ${styles.cellSPP}`}>
      <span className={styles.sppPrice}>
        {vc.lastPriceASpp === 0 ? (
          <PiEmptyDuotone color="red" />
        ) : (
          vc.lastPriceASpp
        )}
        {vc.lastPriceASpp === 0 ? (
          ''
        ) : (
          <MdCurrencyRuble className={styles.ruble} />
        )}
      </span>
      <div className={styles.sppAmount}>
        {vc.sppAmount}
        <RiDiscountPercentLine />
      </div>
    </div>
  );
};

export default BodyPriceASPP;
