import { IoIosHelpCircleOutline } from 'react-icons/io';
import {
  showTooltip,
  hideTooltip,
} from '../../../../TooltipManager/TooltipManager';
import styles from './style.module.css';

const HeaderBuyout = () => {
  const handleMouseEnter = (e) => {
    showTooltip(
      'Средний процент выкупа за последние две недели, не считая предыдущую. Для новых товаров указывается средний процент выкупа по категории (по данным MPSTAT).'
    );
  };
  const handleMouseLeave = () => {
    setTimeout(() => hideTooltip(), 150); // задержка для сглаживания
  };
  return (
    <div className={`${styles.cell} ${styles.cellBuyout}`}>
      % Выкупа
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

export default HeaderBuyout;
