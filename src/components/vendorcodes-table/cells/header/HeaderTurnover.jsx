import { IoIosHelpCircleOutline } from 'react-icons/io';
import {
  showTooltip,
  hideTooltip,
} from '../../../../TooltipManager/TooltipManager';
import styles from './style.module.css';

const HeaderTurnover = () => {
  const handleMouseEnter = (e) => {
    showTooltip(
      'Остатки на складе WB, деленные на среднее количество заказов за последние 7 дней.'
    );
  };
  const handleMouseLeave = () => {
    setTimeout(() => hideTooltip(), 150); // задержка для сглаживания
  };

  return (
    <div className={styles.cell}>
      Оборачиваемость WB
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

export default HeaderTurnover;
