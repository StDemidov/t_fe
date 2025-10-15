import { IoIosHelpCircleOutline } from 'react-icons/io';
import {
  showTooltip,
  hideTooltip,
} from '../../../../TooltipManager/TooltipManager';

import styles from './style.module.css';

const HeaderROI = () => {
  const handleMouseEnter = (e) => {
    showTooltip(
      'Средняя EBITDA за период с вычетом среднего CPS за период, деленная на себестоимость с НДС.'
    );
  };
  const handleMouseLeave = () => {
    setTimeout(() => hideTooltip(), 150); // задержка для сглаживания
  };

  return (
    <div className={`${styles.cell} ${styles.cellCPS}`}>
      ROI
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

export default HeaderROI;
