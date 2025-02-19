import styles from './style.module.css';

const FooterCPO = ({ avgCostPerOrder }) => {
  return (
    <div className={styles.cell}>
      {avgCostPerOrder ? avgCostPerOrder.toLocaleString() : 0} ₽
    </div>
  );
};

export default FooterCPO;
