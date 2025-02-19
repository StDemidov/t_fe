import styles from './style.module.css';

const HeaderBuyout = () => {
  return (
    <div className={`${styles.cell} ${styles.cellBuyout}`}>
      <abbr
        title={
          'Средний процент выкупа за последние две недели, не считая предыдущую. Для новых товаров указывается средний процент выкупа по категории (по данным MPSTAT).'
        }
      >
        % Выкупа{' '}
      </abbr>
    </div>
  );
};

export default HeaderBuyout;
