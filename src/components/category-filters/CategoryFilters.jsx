import CategoryListFilter from './category-list-filter/CategoryListFilter';
import CategoryNameFilter from './category-name-filter/CategoryNameFilter';

import styles from './style.module.css';

const CategoryFilters = ({ categoryNames }) => {
  return (
    <div className={styles.filterSection}>
      <CategoryListFilter options={categoryNames} />
      <CategoryNameFilter />
    </div>
  );
};

export default CategoryFilters;
