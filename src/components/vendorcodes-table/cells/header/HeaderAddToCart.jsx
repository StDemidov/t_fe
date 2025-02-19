import styles from './style.module.css';

const HeaderAddToCart = () => {
  return (
    <div className={styles.cell}>
      <abbr
        title={
          'Процент добавления в корзину (количество кликов по карточке / количество добавления в корзину).'
        }
      >
        % Добавления в корзину
      </abbr>
    </div>
  );
};

export default HeaderAddToCart;
