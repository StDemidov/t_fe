import { useSelector } from 'react-redux';
import {
  selectOrdersCategoryFilter,
  selectOrdersPatternFilter,
  selectOrdersSortingType,
} from '../../../redux/slices/basePrints';
import FiltersUpcomingPage from '../FiltersUpcomingPage/FiltersUpcomingPage';
import OrderCard from './OrderCard';

import styles from './style.module.css';

const UpcomingPage = ({ orders }) => {
  const categoryFilter = useSelector(selectOrdersCategoryFilter);
  const patternFilter = useSelector(selectOrdersPatternFilter);
  const selectedSorting = useSelector(selectOrdersSortingType);

  const filteredOrdersCategory = orders.filter((item) => {
    let categoryMatch = true;

    if (categoryFilter.length) {
      categoryMatch = categoryFilter.includes(item.category_name);
    }
    return categoryMatch;
  });
  const filteredOrders = filteredOrdersCategory.filter((item) => {
    let patternMatch = true;
    if (patternFilter.length) {
      patternMatch = patternFilter.includes(item.pattern_name);
    }
    return patternMatch;
  });

  getSortedData(filteredOrders, selectedSorting);
  return (
    <div>
      <FiltersUpcomingPage
        items={orders}
        filteredItems={filteredOrders}
        count={filteredOrders.length}
        forOrders={true}
      />
      {orders.length === 0 ? (
        <div>Пусто</div>
      ) : (
        <div className={styles.itemsGrid}>
          {filteredOrders.map((item, idx) => (
            <OrderCard key={idx} item={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export default UpcomingPage;

const getSortedData = (data, selectedSorting) => {
  switch (selectedSorting) {
    case 'От новых к стырым':
      data.sort((a, b) => (a.created_at > b.created_at ? -1 : 1));
      break;
    case 'От старых к новым':
      data.sort((a, b) => (a.created_at > b.created_at ? 1 : -1));
      break;
    default:
      data.sort((a, b) => (a.created_at > b.created_at ? -1 : 1));
  }
};
