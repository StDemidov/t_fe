import { IoIosHelpCircleOutline } from 'react-icons/io';
import {
  showTooltip,
  hideTooltip,
} from '../../../../TooltipManager/TooltipManager';
import styles from './style.module.css';

const HeaderPriceBSPP = () => {
  const handleMouseEnter = (e) => {
    showTooltip('Цена со скидкой продавца, но без учета СПП.');
  };
  const handleMouseLeave = () => {
    setTimeout(() => hideTooltip(), 150); // задержка для сглаживания
  };

  return (
    <div className={styles.cell}>
      Цена до СПП
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

export default HeaderPriceBSPP;
