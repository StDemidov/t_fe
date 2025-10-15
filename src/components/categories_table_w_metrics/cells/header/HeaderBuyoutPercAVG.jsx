import styles from '../../style.module.css';
import { IoIosHelpCircleOutline } from 'react-icons/io';
import {
  showTooltip,
  hideTooltip,
} from '../../../../TooltipManager/TooltipManager';

const HeaderBuyoutPercAVG = () => {
  const handleMouseEnter = (e) => {
    showTooltip(
      'Средний процент выкупа заказанного товара. Красный показатель означает, что процент выкупа меньше бенчмарка, расчитанного на данных MPStat, фиолетовый - выше или равно. При наведении курсора на график выводится разница текущего процент выкупа от бенчмарка в процентных пунктах.'
    );
  };
  const handleMouseLeave = () => {
    setTimeout(() => hideTooltip(), 150); // задержка для сглаживания
  };

  return (
    <div className={styles.headerCell}>
      Процент выкупа
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

export default HeaderBuyoutPercAVG;
