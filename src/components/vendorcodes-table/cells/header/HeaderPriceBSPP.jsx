import styles from './style.module.css';

const HeaderPriceBSPP = () => {
  return (
    <div className={styles.cell}>
      <abbr title={'Цена со скидкой продавца, но без учета СПП.'}>
        Цена до СПП
      </abbr>
    </div>
  );
};

export default HeaderPriceBSPP;
