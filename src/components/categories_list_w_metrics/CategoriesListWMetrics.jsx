import { useDispatch, useSelector } from 'react-redux';
import { FaSpinner } from 'react-icons/fa';
import { useSpring, animated } from '@react-spring/web';
import {
  fetchCategoriesMetrics,
  selectCategoriesMetrics,
  selectIsLoading,
} from '../../redux/slices/categoriesMetricsSlice';
import { useEffect, useState, useRef } from 'react';
import CategoriesTableWMetrics from '../categories_table_w_metrics/CategoriesTableWMetrics';
import CategoriesColumnsSettings from '../categories_columns_settings/CategoriesColumnsSettings';
import { LuColumns3 } from 'react-icons/lu';
import styles from './style.module.css';

import { hostName } from '../../utils/host';

const initialColumnsData = [
  { key: 'dailyOrders', label: 'Заказы', hidden: false },
  { key: 'dailySales', label: 'Выкупы', hidden: false },
  { key: 'dailyStocksWB', label: 'Остатки WB', hidden: false },
  { key: 'ebitdaAVG', label: 'Средняя EBITDA', hidden: false },
  { key: 'dailyEbitda', label: 'EBITDA / День', hidden: false },
  {
    key: 'dailyEbitdaWOAds',
    label: 'EBITDA / День (без рекламы)',
    hidden: false,
  },
  { key: 'dailyAdsCosts', label: 'Расходы на рекламу', hidden: false },
  { key: 'cpoClear', label: 'CPO (Чистый)', hidden: false },
  { key: 'cpoDirty', label: 'CPO (Размазанный)', hidden: false },
  { key: 'cpsClear', label: 'CPS (Чистый)', hidden: false },
  { key: 'cpsDirty', label: 'CPS (Размазанный)', hidden: false },
  {
    key: 'dailyPricesAvgBeforeSpp',
    label: 'Средняя цена',
    hidden: false,
  },
  { key: 'crClickToCartAVG', label: '% из клика в корзину', hidden: false },
  { key: 'crCartToOrderAVG', label: '% из корзины в заказ', hidden: false },
  { key: 'crClickToOrderAVG', label: '% из клика в заказ', hidden: false },
  { key: 'buyoutPercAVG', label: 'Процент выкупа', hidden: false },
  { key: 'avgSelfprice', label: 'Средняя себестоимость', hidden: false },
];

const CategoriesListWMetrics = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const categories = useSelector(selectCategoriesMetrics);

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [columns, setColumns] = useState(initialColumnsData);
  const originalColumnsRef = useRef(initialColumnsData);

  const animStyles = useSpring({
    loop: false,
    from: { opacity: '0' },
    to: { opacity: '1' },
    config: { duration: 600 },
  });

  useEffect(() => {
    dispatch(fetchCategoriesMetrics(`${hostName}/category_metrics/`));
  }, [dispatch]);

  const handleApplyColumns = (newColumns) => {
    setColumns(newColumns);
    setIsModalOpen(false);
  };

  return (
    <>
      {isLoading ? (
        <FaSpinner className="spinner" />
      ) : (
        <animated.div style={animStyles}>
          <section>
            <div className={styles.headerBlock}>
              <h1>Категории</h1>
              <div
                className={styles.columnSettingsBtn}
                onClick={() => setIsModalOpen(true)}
              >
                <LuColumns3 />
              </div>
            </div>
            <CategoriesTableWMetrics
              categories={categories}
              columns={columns}
            />
            <CategoriesColumnsSettings
              open={isModalOpen}
              onClose={() => setIsModalOpen(false)}
              currentColumns={columns}
              initialColumns={originalColumnsRef.current}
              onApply={handleApplyColumns}
            />
          </section>
        </animated.div>
      )}
    </>
  );
};

export default CategoriesListWMetrics;
