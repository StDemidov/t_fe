import styles from './style.module.css';

const FooterCartToOrder = ({ avgCartToOrder }) => {
  return (
    <div className={styles.cell}>
      {avgCartToOrder ? avgCartToOrder.toLocaleString() : 0} %
    </div>
  );
};

export default FooterCartToOrder;
