import { useSelector } from 'react-redux';
import ItemCard from './ItemCard';
import styles from './style.module.css';
import { selectSelectedSkus } from '../../../../redux/slices/regroupSlice';

const ItemList = ({ items }) => {
  const selectedSkus = useSelector(selectSelectedSkus);
  return (
    <div className={styles.wrapper}>
      <div className={styles.grid}>
        {items.map((item) => (
          <ItemCard
            key={item.sku}
            item={item}
            isSelected={selectedSkus.includes(item.sku)}
            notReady={selectedSkus.length === 0}
          />
        ))}
      </div>
    </div>
  );
};

export default ItemList;
