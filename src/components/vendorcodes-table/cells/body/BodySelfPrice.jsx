import styles from './style.module.css';

const BodySelfPrice = ({ vc }) => {
  return (
    <div className={`${styles.cell} ${styles.cellSelfPrice}`}>
      {vc.selfPrice} ₽
    </div>
  );
};

export default BodySelfPrice;
