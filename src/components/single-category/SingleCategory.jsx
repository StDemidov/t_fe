import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useSpring, animated } from '@react-spring/web';
import { FaSpinner } from 'react-icons/fa';

import {
  fetchCategories,
  selectCategories,
  selectIsLoading,
} from '../../redux/slices/categorySlice';

import CategoryPlot from '../category-plot/CategoryPlot';

import styles from './style.module.css';
import { hostName } from '../../utils/host';

const SingleCategory = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const categories = useSelector(selectCategories);
  let { id } = useParams();
  useEffect(() => {
    if (categories.length === 0) {
      dispatch(fetchCategories(`${hostName}/category/`));
    }
  }, [categories.length, dispatch]);
  const categoryData = categories.filter((category) => {
    return category?.id === Number(id);
  })[0];
  const animStyles = useSpring({
    loop: false,
    from: { opacity: '0' },
    to: { opacity: '1' },
    config: { duration: '600' },
  });
  return (
    <>
      {isLoading || categories.length === 0 ? (
        <FaSpinner />
      ) : (
        <section>
          <h1>Данные по категории "{categoryData?.name}"</h1>
          <animated.div
            className={styles.plotContainer}
            style={{ ...animStyles }}
          >
            <div className={styles.plot}>
              <CategoryPlot
                graphData={categoryData?.seasonal_koefs.split(',').map(Number)}
                label="Значение коэффициента сезонности"
                y_text="Коэффициент сезонности"
                startDate1={categoryData.enter_date_1}
                endDate1={categoryData.exit_date_1}
                startDate2={categoryData.enter_date_2}
                endDate2={categoryData.exit_date_2}
              />
            </div>
            <div className={styles.plot}>
              <CategoryPlot
                graphData={categoryData?.avg_price_koefs.split(',').map(Number)}
                label="Значение коэффициента цены"
                y_text="Коэффициент цены"
                startDate1={categoryData.enter_date_1}
                endDate1={categoryData.exit_date_1}
                startDate2={categoryData.enter_date_2}
                endDate2={categoryData.exit_date_2}
              />
            </div>
          </animated.div>
        </section>
      )}
    </>
  );
};

export default SingleCategory;
