import { v4 as uuidv4 } from 'uuid';
import styles from './style.module.css';
import { useDispatch } from 'react-redux';
import { setNotification } from '../../../../../../redux/slices/notificationSlice';

const SkuBaseCell = ({ sku, image, skuName, creationDate, cellStyle }) => {
  const dispatch = useDispatch();

  const handleCopy = (event) => {
    event.stopPropagation(); // Останавливаем всплытие
    event.preventDefault(); // Предотвращаем переход по ссылке (если нужно)

    navigator.clipboard.writeText(
      event.currentTarget.getAttribute('data-value')
    );
    dispatch(setNotification('Скопировано'));
  };
  return (
    <div className={`${cellStyle} ${styles.skuBaseCell}`}>
      <div className={styles.sku} onClick={handleCopy} data-value={sku}>
        {sku}
      </div>
      <div
        className={styles.skuPhoto}
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0), rgba(93, 50, 212, 0)), url(${image}?v=${uuidv4()})`,
        }}
      ></div>
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
