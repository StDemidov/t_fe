import styles from './style.module.css';

const BodyCPS = ({ vc }) => {
  return (
    <div className={`${styles.cell} ${styles.cellCPS}`}>
      {Math.round(vc.costPerOrderAVG / (Number(vc.buyoutP) / 100))} ₽
    </div>
  );
};

export default BodyCPS;
