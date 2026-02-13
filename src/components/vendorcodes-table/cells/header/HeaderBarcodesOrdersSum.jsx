import { IoIosHelpCircleOutline } from 'react-icons/io';
import {
  showTooltip,
  hideTooltip,
} from '../../../../TooltipManager/TooltipManager';
import styles from './style.module.css';

const HeaderBarcodesOrdersSum = () => {
  const handleMouseEnter = (e) => {
    showTooltip(
      'Количество товара в заказе. Формируется через вкладку Баркоды.'
    );
  };
  const handleMouseLeave = () => {
    setTimeout(() => hideTooltip(), 150); // задержка для сглаживания
  };
  return (
    <div className={`${styles.cell} ${styles.cellBuyout}`}>
      В заказе
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

export default HeaderBarcodesOrdersSum;
