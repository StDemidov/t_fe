import styles from './style.module.css';

const UnfilledItemCard = ({ item }) => {
  return (
    <div
      className={styles.card}
      style={{
        backgroundImage: `linear-gradient(rgba(111, 111, 111, 0.67), rgba(101, 101, 101, 0.64)), url(${item.image})`,
      }}
    >
      <div className={styles.title}>
        <span>{item.vendorCode}</span>
      </div>
    </div>
  );
};

export default UnfilledItemCard;
