import { v4 as uuidv4 } from 'uuid';
import { IoCheckmarkCircle } from 'react-icons/io5';

import styles from './style.module.css';
import { useDispatch } from 'react-redux';
import { setNotification } from '../../../../../../redux/slices/notificationSlice';

const SkuBaseCell = ({
  sku,
  image,
  skuName,
  campId,
  creationDate,
  cellStyle,
  selectedCamps,
  setSelectedCamps,
}) => {
  const dispatch = useDispatch();
  let campSelected = selectedCamps.includes(campId);

  const handleCopy = (event) => {
    event.stopPropagation(); // Останавливаем всплытие
    event.preventDefault(); // Предотвращаем переход по ссылке (если нужно)

    navigator.clipboard.writeText(
      event.currentTarget.getAttribute('data-value')
    );
    dispatch(setNotification('Скопировано'));
  };

  const handleSelection = (event) => {
    event.stopPropagation(); // Останавливаем всплытие
    event.preventDefault(); // Предотвращаем переход по ссылке (если нужно)

    if (selectedCamps.includes(campId)) {
      const newList = selectedCamps.filter((elem) => {
        return elem !== campId;
      });
      setSelectedCamps(newList);
    } else {
      setSelectedCamps([].concat(selectedCamps, campId));
    }
    campSelected = !campSelected;
  };
  return (
    <div className={`${cellStyle} ${styles.skuBaseCell}`}>
      <div className={styles.sku} onClick={handleCopy} data-value={sku}>
        {sku}
      </div>
      <div
        onClick={handleSelection}
        className={styles.skuPhoto}
        style={{
          backgroundImage: campSelected
            ? `linear-gradient(rgba(255, 255, 255, 0.7), rgba(114, 114, 114, 0.7)), url(${image})`
            : `linear-gradient(rgba(255, 255, 255, 0), rgba(114, 114, 114, 0)), url(${image})`,
          cursor: 'pointer',
        }}
      >
        {campSelected ? <IoCheckmarkCircle /> : <></>}
      </div>
      <div className={styles.nameAndDate}>
        <div
          className={styles.skuName}
          data-value={skuName}
          onClick={handleCopy}
          style={{ cursor: 'copy' }}
        >
          {skuName}
        </div>
        <div className={styles.creationDate}>
          {creationDate ? creationDate : '-'}
        </div>
      </div>
    </div>
  );
};

export default SkuBaseCell;
