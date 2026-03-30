import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  resetSelectedSkus,
  selectRegroupFilterCategory,
  selectRegroupFilterPatterns,
  selectRegroupFilterStyle,
  setSelectedSkus,
} from '../../../redux/slices/regroupSlice';
import InfoMessage from './elements/InfoMessage';
import ItemList from './elements/ItemList';
import FinalSettings from './elements/FinalSettings';

import styles from './style.module.css';
import RegroupFiltersBox from './regroup_filters/RegroupFiltersBox';

const RegroupPreparingPage = ({ allItems }) => {
  const categoryFilter = useSelector(selectRegroupFilterCategory);
  const patternFilter = useSelector(selectRegroupFilterPatterns);
  const styleFilter = useSelector(selectRegroupFilterStyle);
  const dispatch = useDispatch();

  const filteredItemsByCategory = allItems.filter((item) => {
    let categoryMatch = true;
    if (item.pattern === null || item.style === null) {
      return false;
    }

    if (categoryFilter !== '') {
      categoryMatch = item.categoryName == categoryFilter;
    }
    return categoryMatch;
  });

  const fullFilteredItems = filteredItemsByCategory.filter((item) => {
    let patternMatch = true;
    let styleMatch = true;

    if (styleFilter.length !== 0) {
      let lowerStyleFilter = styleFilter.map((style) => {
        return style.toLowerCase();
      });
      styleMatch = lowerStyleFilter.includes(item.style.toLowerCase());
    }
    if (patternFilter.length !== 0) {
      patternMatch = patternFilter.includes(item.pattern);
    }
    return styleMatch && patternMatch;
  });

  useEffect(() => {
    if (categoryFilter !== '' && styleFilter.length != 0) {
      const skus = fullFilteredItems.map((item) => item.sku);
      dispatch(setSelectedSkus(skus));
    } else {
      dispatch(resetSelectedSkus());
    }
  }, [categoryFilter, styleFilter, patternFilter]);

  return (
    <div>
      <InfoMessage />
      <div className={styles.filtersAndSettings}>
        <RegroupFiltersBox
          allItems={allItems}
          filteredByCategory={filteredItemsByCategory}
        />
        <FinalSettings />
      </div>
      <ItemList items={fullFilteredItems} />
    </div>
  );
};

export default RegroupPreparingPage;
