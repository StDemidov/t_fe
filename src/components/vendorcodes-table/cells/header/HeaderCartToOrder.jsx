import { IoIosHelpCircleOutline } from 'react-icons/io';
import {
  showTooltip,
  hideTooltip,
} from '../../../../TooltipManager/TooltipManager';

import styles from './style.module.css';

const HeaderCartToOrder = () => {
  const handleMouseEnter = (e) => {
    showTooltip(
      'Процент заказов из корзины ( количество добавления в корзину / количество заказов ).'
    );
  };
  const handleMouseLeave = () => {
    setTimeout(() => hideTooltip(), 150); // задержка для сглаживания
  };

  return (
    <div className={styles.cell}>
      % Из корзины в заказ
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

export default HeaderCartToOrder;
