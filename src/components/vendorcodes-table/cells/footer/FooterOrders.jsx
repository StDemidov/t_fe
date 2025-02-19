import styles from './style.module.css';

const FooterOrders = ({ data }) => {
  return (
    <div className={styles.cell}>
      {data.reduce((n, { ordersSum }) => n + ordersSum, 0).toLocaleString()}
    </div>
  );
};

export default FooterOrders;
