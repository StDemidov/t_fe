import styles from './style.module.css';

const HeaderClickToOrder = () => {
  return (
    <div className={styles.cell}>
      <abbr
        title={
          'Процент заказов из кликов (количество заказов / количество кликов).'
        }
      >
        % Из клика в заказ
      </abbr>
    </div>
  );
};

export default HeaderClickToOrder;
