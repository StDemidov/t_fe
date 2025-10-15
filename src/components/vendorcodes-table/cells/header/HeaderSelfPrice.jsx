import { IoIosHelpCircleOutline } from 'react-icons/io';
import {
  showTooltip,
  hideTooltip,
} from '../../../../TooltipManager/TooltipManager';
import styles from './style.module.css';

const HeaderSelfPrice = () => {
  const handleMouseEnter = (e) => {
    showTooltip(
      'Себестоимость товара - услуги без НДС + ткань с НДС + косты. Данные тянутся из таблицы СЕБЕСТОИМОСТЬ.'
    );
  };
  const handleMouseLeave = () => {
    setTimeout(() => hideTooltip(), 150); // задержка для сглаживания
  };

  return (
    <div className={`${styles.cell} ${styles.cellSelfPrice}`}>
      Себестоимость
      <span>
        <IoIosHelpCircleOutline
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={styles.helpIcon}
        />
      </span>
    </div>
  );
};

export default HeaderSelfPrice;
