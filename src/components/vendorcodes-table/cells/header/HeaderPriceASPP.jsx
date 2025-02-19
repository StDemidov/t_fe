import styles from './style.module.css';

const HeaderPriceASPP = () => {
  return (
    <div className={`${styles.cell} ${styles.cellSPP}`}>
      <abbr title={'Цена c учетом СПП на текущий момент.'}>Цена после СПП</abbr>
    </div>
  );
};

export default HeaderPriceASPP;
