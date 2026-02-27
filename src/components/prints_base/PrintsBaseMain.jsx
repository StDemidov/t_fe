import { useEffect, useState } from 'react';
import styles from './style.module.css';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchItems,
  fetchOrders,
  selectItems,
  selectOrders,
} from '../../redux/slices/basePrints';
import BasePage from './BasePage/BasePage';
import UpcomingPage from './UpcomingPage/UpcomingPage';

import { hostName } from '../../utils/host';

const PrintsBaseMain = () => {
  const [currentPage, setCurrentPage] = useState('base');
  const upcomingItems = useSelector(selectItems);
  const upcomingOrders = useSelector(selectOrders);

  const [sizesStorage, setSizesStorage] = useState({});

  const dispatch = useDispatch();
  useEffect(() => {
    dispatch(
      fetchItems(`${hostName}/prints_base/get_full_upcoming_items_data`)
    );
    dispatch(
      fetchOrders(`${hostName}/prints_base/get_full_upcoming_orders_data`)
    );
  }, []);
  return (
    <section>
      <div className={styles.choosePageButtons}>
        <button
          className={currentPage === 'base' ? styles.buttonActivePage : ''}
          onClick={() => setCurrentPage('base')}
          disabled={currentPage === 'base'}
        >
          База принтов
        </button>
        <button
          className={currentPage === 'upcoming' ? styles.buttonActivePage : ''}
          onClick={() => setCurrentPage('upcoming')}
          disabled={currentPage === 'upcoming'}
        >
          Скоро выйдут
        </button>
      </div>
      <div>
        {currentPage === 'base' ? (
          <BasePage
            items={upcomingItems}
            sizesStorage={sizesStorage}
            setSizesStorage={setSizesStorage}
          />
        ) : (
          <UpcomingPage orders={upcomingOrders} />
        )}
      </div>
    </section>
  );
};

export default PrintsBaseMain;
