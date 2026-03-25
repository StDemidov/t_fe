import { useDispatch } from 'react-redux';
import { IoMdCheckmarkCircle } from 'react-icons/io';

import styles from './style.module.css';
import { toggleSku } from '../../../../redux/slices/regroupSlice';

const ItemCard = ({ item, isSelected, notReady = true }) => {
  const dispatch = useDispatch();

  const handleToggle = (e) => {
    if (!notReady) {
      e.stopPropagation();
      dispatch(toggleSku(item.sku));
    }
  };
  return (
    <div
      className={styles.card}
      onClick={handleToggle}
      style={{
        backgroundImage: `${
          isSelected
            ? ''
            : 'linear-gradient(rgba(111, 111, 111, 0.67), rgba(101, 101, 101, 0.64)),'
        }url(${item.image})`,
      }}
    >
      <div className={styles.title}>
        <span>{item.vendorCode}</span>
      </div>
      {!notReady && isSelected && (
        <IoMdCheckmarkCircle className={styles.checkmark} />
      )}

      {/* {!notReady && !isSelected && <div className={styles.unchecked} />} */}
    </div>
  );
};

export default ItemCard;
