import styles from './style.module.css';

const FooterADSCosts = ({ data }) => {
  return (
    <div className={styles.cell}>
      {data.reduce((n, { adsCostsSum }) => n + adsCostsSum, 0).toLocaleString()}{' '}
      ₽
    </div>
  );
};

export default FooterADSCosts;
