import styles from '../../style.module.css';
import { IoIosHelpCircleOutline } from 'react-icons/io';
import {
  showTooltip,
  hideTooltip,
} from '../../../../TooltipManager/TooltipManager';

const HeaderCrClickToOrder = () => {
  const handleMouseEnter = (e) => {
    showTooltip(
      'Конверсия из перехода в карточку в заказ товара. То есть, какой процент покупателей после перехода в карточку оформляют заказ.'
    );
  };
  const handleMouseLeave = () => {
    setTimeout(() => hideTooltip(), 150); // задержка для сглаживания
  };

  return (
    <div className={styles.headerCell}>
      % из клика в заказ
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

export default HeaderCrClickToOrder;
