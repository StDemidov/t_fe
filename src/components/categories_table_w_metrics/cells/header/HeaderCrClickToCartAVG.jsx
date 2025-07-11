import styles from '../../style.module.css';
import { IoIosHelpCircleOutline } from 'react-icons/io';
import {
  showTooltip,
  hideTooltip,
} from '../../../../TooltipManager/TooltipManager';

const HeaderCrClickToCartAVG = () => {
  const handleMouseEnter = (e) => {
    showTooltip(
      'Конверсия из перехода в карточку в добавление в корзину. То есть, какой процент покупателей, перейдя в карточку товара, добавил его в корзину.'
    );
  };
  const handleMouseLeave = () => {
    setTimeout(() => hideTooltip(), 150); // задержка для сглаживания
  };

  return (
    <div className={styles.headerCell}>
      % из клика в корзину
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

export default HeaderCrClickToCartAVG;
