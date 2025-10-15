import { IoIosHelpCircleOutline } from 'react-icons/io';
import {
  showTooltip,
  hideTooltip,
} from '../../../../TooltipManager/TooltipManager';
import styles from './style.module.css';

const HeaderSales = () => {
  const handleMouseEnter = (e) => {
    showTooltip(
      'Количество выкупов на дату. Не связано по датам с заказами, т.к. в одну дату может быть выкуплен товар с разными датами Заказа. Голубые столбики - не точные продажи, полученные НЕ из отчета по реализации. Фиолетовые - продажи полученные из отчета по реализации.'
    );
  };
  const handleMouseLeave = () => {
    setTimeout(() => hideTooltip(), 150); // задержка для сглаживания
  };

  return (
    <div className={styles.cell}>
      Выкупы
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

export default HeaderSales;
