import { IoIosHelpCircleOutline } from 'react-icons/io';
import {
  showTooltip,
  hideTooltip,
} from '../../../../TooltipManager/TooltipManager';
import styles from './style.module.css';

const HeaderCampaigns = () => {
  const handleMouseEnter = (e) => {
    showTooltip(
      'Если тип кампании выделен КРАСНЫМ, то такого типа кампании для артикула нет, если горит ОРАНЖЕВЫМ, значит кампания данного типа на паузе, если она цвет ЗЕЛЕНЫЙ, значит кампания активна'
    );
  };
  const handleMouseLeave = () => {
    setTimeout(() => hideTooltip(), 150); // задержка для сглаживания
  };

  return (
    <div className={styles.cell}>
      Кампании
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

export default HeaderCampaigns;
