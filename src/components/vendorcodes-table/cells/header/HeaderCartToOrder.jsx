import styles from './style.module.css';

const HeaderCartToOrder = () => {
  return (
    <div className={styles.cell}>
      <abbr
        title={
          'Процент заказов из корзины (количество добавления в корзину / количество заказов).'
        }
      >
        % Из корзины в заказ
      </abbr>
    </div>
  );
};

export default HeaderCartToOrder;
