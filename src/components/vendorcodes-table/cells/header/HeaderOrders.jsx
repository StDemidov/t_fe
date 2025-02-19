import styles from './style.module.css';

const HeaderOrders = () => {
  return (
    <div className={styles.cell}>
      <abbr title={'Количество заказанного товара на дату, не продажи.'}>
        Заказы
      </abbr>
    </div>
  );
};

export default HeaderOrders;
