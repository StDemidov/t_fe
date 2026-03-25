import styles from './style.module.css';
import UnfilledItemCard from './UnfilledItemCard';

const UnfilledItemList = ({ items }) => {
  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {items.map((item) => (
          <UnfilledItemCard key={item.sku} item={item} />
        ))}
      </div>
    </div>
  );
};

export default UnfilledItemList;
