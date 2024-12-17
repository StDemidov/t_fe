import { useDispatch, useSelector } from 'react-redux';
import { FaSpinner } from 'react-icons/fa';
import { useSpring, animated } from '@react-spring/web';
import {
  fetchCategories,
  selectCategories,
  selectIsLoading,
} from '../../redux/slices/categorySlice';
import {
  selectCategoryListFilter,
  selectCategoryNameFilter,
} from '../../redux/slices/filterSlice';
import { useEffect } from 'react';
import CategoryTable from '../category-table/CategoryTable';
import CategoryFilters from '../category-filters/CategoryFilters';

import { hostName } from '../../utils/host';

const CategoriesList = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const categories = useSelector(selectCategories);
  const categoryFilter = useSelector(selectCategoryListFilter);
  const categoryNameFilter = useSelector(selectCategoryNameFilter);

  const animStyles = useSpring({
    loop: false,
    from: { opacity: '0' },
    to: { opacity: '1' },
    config: { duration: '600' },
  });

  useEffect(() => {
    dispatch(fetchCategories(`${hostName}/category/`));
  }, [dispatch]);

  const filteredCategories = categories.filter((cat) => {
    let categoryMatch = true;
    let categoryNameMatch = true;
    if (categoryFilter.length !== 0) {
      categoryMatch = categoryFilter.includes(cat.name);
    }
    if (categoryNameFilter.length !== 0) {
      categoryNameMatch = cat.name
        .toLowerCase()
        .includes(categoryNameFilter.toLowerCase());
    }
    return categoryMatch && categoryNameMatch;
  });

  const categoriesNames = categories.map((cat) => {
    return cat.name;
  });

  return (
    <>
      {isLoading ? (
        <FaSpinner className="spinner" />
      ) : (
        <animated.div style={{ ...animStyles }}>
          <section>
            <h1>Категории</h1>
            <CategoryFilters categoryNames={categoriesNames} />
            <CategoryTable categories={filteredCategories} />
          </section>
        </animated.div>
      )}
    </>
  );
};

export default CategoriesList;
