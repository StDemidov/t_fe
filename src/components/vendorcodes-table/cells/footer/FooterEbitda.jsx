import styles from './style.module.css';

const FooterEbitda = ({ avg_ebitda }) => {
  return (
    <div className={`${styles.cell} ${styles.cellEbitda}`}>
      {avg_ebitda?.toLocaleString() ? avg_ebitda : 0} ₽
    </div>
  );
};

export default FooterEbitda;
