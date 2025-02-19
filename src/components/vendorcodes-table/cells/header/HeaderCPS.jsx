import styles from './style.module.css';

const HeaderCPS = () => {
  return (
    <div className={`${styles.cell} ${styles.cellCPS}`}>
      <abbr
        title={
          'Среднее значение трат РК на каждый заказ, умноженная на процент выкупа.'
        }
      >
        CPS
      </abbr>
    </div>
  );
};

export default HeaderCPS;
