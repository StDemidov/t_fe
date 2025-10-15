import { IoIosHelpCircleOutline } from 'react-icons/io';
import {
  showTooltip,
  hideTooltip,
} from '../../../../TooltipManager/TooltipManager';

import styles from './style.module.css';

const HeaderADSCosts = () => {
  const handleMouseEnter = (e) => {
    showTooltip('Сумма трат по всем кампаниям, запущенных на данный артикул.');
  };
  const handleMouseLeave = () => {
    setTimeout(() => hideTooltip(), 150); // задержка для сглаживания
  };

  return (
    <div className={styles.cell}>
      Расходы на РК
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

export default HeaderADSCosts;
