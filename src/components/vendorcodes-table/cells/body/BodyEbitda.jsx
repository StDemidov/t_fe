import styles from './style.module.css';

const BodyEbitda = ({ vc }) => {
  return (
    <div className={`${styles.cell} ${styles.cellEbitda}`}>{vc.ebitda} ₽</div>
  );
};

export default BodyEbitda;
