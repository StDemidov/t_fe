import styles from './style.module.css';

const FooterDailyEbitda = ({ data }) => {
  return (
    <div className={styles.cell}>
      {data.reduce((n, { debSum }) => n + debSum, 0).toLocaleString()} ₽
    </div>
  );
};

export default FooterDailyEbitda;
