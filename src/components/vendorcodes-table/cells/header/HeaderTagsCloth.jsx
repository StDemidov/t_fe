import { IoIosHelpCircleOutline } from 'react-icons/io';
import {
  showTooltip,
  hideTooltip,
} from '../../../../TooltipManager/TooltipManager';

import styles from './style.module.css';

const HeaderTagsCloth = () => {
  const handleMouseEnter = (e) => {
    showTooltip(
      'Чтоб создать тег необходимо кликнуть на + у любого артикула, ввести название нового тега и нажать зеленую кнопку. Теги не должны повторяться по названию, иначе выдаст ошибку. После этого тег создан, но не внесен в БД, если вы сейчас обновите страницу, тег исчезнет. Поэтому после всех изменений (созданных тегов, присваиваивания тегов артикулам) - обязательно нужно нажать кнопку, которая появляется рядом с фильтрами - "Сохранить изменения". НЕ НУЖНО нажимать ее после каждого изменения, достаточно, перед уходом со страницы нажать ее один раз. Чтобы применить тег к артикулу, необходимо нажать +, выбрать тег, или отменить имеющийся, и обязательно нажать "Принять", иначе это будет считаться за миссклик.'
    );
  };
  const handleMouseLeave = () => {
    setTimeout(() => hideTooltip(), 150); // задержка для сглаживания
  };

  return (
    <div className={styles.cell}>
      Теги (ткань)
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

export default HeaderTagsCloth;
