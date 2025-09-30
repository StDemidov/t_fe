import styles from './style.module.css';

const HeaderDeadline = () => {
  return (
    <div className={styles.cell}>
      <abbr title={'Дата, до которой должен быть распродан товар.'}>
        Дедлайн
      </abbr>
    </div>
  );
};

export default HeaderDeadline;
