import styles from './style.module.css';

const HeaderTagsCloth = () => {
  return (
    <div className={styles.cell}>
      <abbr
        title={
          'Чтоб создать тег необходимо кликнуть на + у любого артикула, ввести название нового тега и нажать зеленую кнопку. Теги не должны повторяться по названию, иначе выдаст ошибку. После этого тег создан, но не внесен в БД, если вы сейчас обновите страницу, тег исчезнет. Поэтому после всех изменений (созданных тегов, присваиваивания тегов артикулам) - обязательно нужно нажать кнопку, которая появляется рядом с фильтрами - "Сохранить изменения". НЕ НУЖНО нажимать ее после каждого изменения, достаточно, перед уходом со страницы нажать ее один раз. Чтобы применить тег к артикулу, необходимо нажать +, выбрать тег, или отменить имеющийся, и обязательно нажать "Принять", иначе это будет считаться за миссклик.'
        }
      >
        Теги (ткань)
      </abbr>
    </div>
  );
};

export default HeaderTagsCloth;
