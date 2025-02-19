import styles from './style.module.css';

const HeaderADSCosts = () => {
  return (
    <div className={styles.cell}>
      <abbr
        title={'Сумма трат по всем кампаниям, запущенных на данный артикул.'}
      >
        Расходы на РК.ВБ
      </abbr>
    </div>
  );
};

export default HeaderADSCosts;
