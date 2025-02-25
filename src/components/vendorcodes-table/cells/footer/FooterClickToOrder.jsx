import styles from './style.module.css';

const FooterClickToOrder = ({ avgClickToOrder }) => {
  return (
    <div className={styles.cell}>
      {avgClickToOrder ? avgClickToOrder.toLocaleString() : 0} %
    </div>
  );
};

export default FooterClickToOrder;
