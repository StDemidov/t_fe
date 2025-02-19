import styles from './style.module.css';

const HeaderWBStocks = () => {
  return (
    <div className={styles.cell}>
      <abbr
        title={'Количество товара на складе ВБ на момент 4 утра текущего дня.'}
      >
        Остатки WB
      </abbr>
    </div>
  );
};

export default HeaderWBStocks;
