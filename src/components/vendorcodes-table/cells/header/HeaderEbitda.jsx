import { IoIosHelpCircleOutline } from 'react-icons/io';
import {
  showTooltip,
  hideTooltip,
} from '../../../../TooltipManager/TooltipManager';
import styles from './style.module.css';

const HeaderEbitda = () => {
  const handleMouseEnter = (e) => {
    showTooltip(
      'EBITDA единицы товара за вчерашний день. Зависит от цены после СПП (которая меняется) и от себестоимости.'
    );
  };
  const handleMouseLeave = () => {
    setTimeout(() => hideTooltip(), 150); // задержка для сглаживания
  };

  return (
    <div className={`${styles.cell} ${styles.cellEbitda}`}>
      EBITDA
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

export default HeaderEbitda;
