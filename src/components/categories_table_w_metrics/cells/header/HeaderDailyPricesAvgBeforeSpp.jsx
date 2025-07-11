import styles from '../../style.module.css';
import { IoIosHelpCircleOutline } from 'react-icons/io';
import {
  showTooltip,
  hideTooltip,
} from '../../../../TooltipManager/TooltipManager';

const HeaderDailyPricesAvgBeforeSpp = () => {
  const handleMouseEnter = (e) => {
    showTooltip(
      'Средняя цена на единицу товара из категории. Учитываются цены только тех товаров, у которых за дату, для которой производится расчет, были заказы.'
    );
  };
  const handleMouseLeave = () => {
    setTimeout(() => hideTooltip(), 150); // задержка для сглаживания
  };

  return (
    <div className={styles.headerCell}>
      Средняя цена
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

export default HeaderDailyPricesAvgBeforeSpp;
