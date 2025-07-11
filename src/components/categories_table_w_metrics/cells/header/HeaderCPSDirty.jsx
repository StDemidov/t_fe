import styles from '../../style.module.css';
import { IoIosHelpCircleOutline } from 'react-icons/io';
import {
  showTooltip,
  hideTooltip,
} from '../../../../TooltipManager/TooltipManager';

const HeaderCPSDirty = () => {
  const handleMouseEnter = (e) => {
    showTooltip(
      'Затраты по рекламе на выкуп. По сути - это размазанный CPO, деленный на средний процент выкупа по категории.'
    );
  };
  const handleMouseLeave = () => {
    setTimeout(() => hideTooltip(), 150); // задержка для сглаживания
  };

  return (
    <div className={styles.headerCell}>
      CPS (Размазанный)
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

export default HeaderCPSDirty;
