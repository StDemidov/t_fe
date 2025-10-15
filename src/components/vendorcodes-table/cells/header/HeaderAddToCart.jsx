import { IoIosHelpCircleOutline } from 'react-icons/io';
import {
  showTooltip,
  hideTooltip,
} from '../../../../TooltipManager/TooltipManager';

import styles from './style.module.css';

const HeaderAddToCart = () => {
  const handleMouseEnter = (e) => {
    showTooltip(
      'Процент добавления в корзину ( количество кликов по карточке / количество добавления в корзину ).'
    );
  };
  const handleMouseLeave = () => {
    setTimeout(() => hideTooltip(), 150); // задержка для сглаживания
  };

  return (
    <div className={styles.cell}>
      % Добавления в корзину
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

export default HeaderAddToCart;
