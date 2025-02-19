import styles from './style.module.css';

const HeaderCPO = () => {
  return (
    <div className={styles.cell}>
      <abbr
        title={
          'Сумма трат по всем кампаниям, запущенных на данный артикул / на количество заказов.'
        }
      >
        CPO
      </abbr>
    </div>
  );
};

export default HeaderCPO;
