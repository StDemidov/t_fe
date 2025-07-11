import styles from '../../style.module.css';
import { IoIosHelpCircleOutline } from 'react-icons/io';
import {
  showTooltip,
  hideTooltip,
} from '../../../../TooltipManager/TooltipManager';

const HeaderItemsCount = () => {
  const handleMouseEnter = (e) => {
    showTooltip(
      'Количество артикулов, у которых за последние 2 месяца был хотя бы один размер, остатки на складе WB которого превышали 50 единиц.'
    );
  };
  const handleMouseLeave = () => {
    setTimeout(() => hideTooltip(), 150); // задержка для сглаживания
  };

  return (
    <div className={styles.headerCell}>
      Активные SKU
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

export default HeaderItemsCount;
