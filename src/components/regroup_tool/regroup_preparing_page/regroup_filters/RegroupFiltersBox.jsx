import { capitalize } from '../../../../utils/beaty';
import RegroupFilterCategory from './regroup_filters_frames/RegroupFilterCategory';
import RegroupFilterPattern from './regroup_filters_frames/RegroupFilterPattern';
import RegroupFilterStyle from './regroup_filters_frames/RegroupFilterStyle';

import styles from './style.module.css';

const RegroupFiltersBox = ({ allItems, filteredByCategory }) => {
  let categoryOptionsRaw = allItems.map((item) => {
    return item.categoryName;
  });
  categoryOptionsRaw = [...new Set(categoryOptionsRaw)];
  const categoryOptions = categoryOptionsRaw.map((category) => {
    return { key: category, name: category };
  });

  let styleOptionsRaw = filteredByCategory.map((item) => {
    return capitalize(item.style);
  });
  styleOptionsRaw = [...new Set(styleOptionsRaw)];
  const styleOptions = styleOptionsRaw.map((style) => {
    return { key: style, name: style };
  });

  let patternOptionsRaw = filteredByCategory.map((item) => {
    return item.pattern;
  });
  patternOptionsRaw = [...new Set(patternOptionsRaw)];
  const patternOptions = patternOptionsRaw.map((pattern) => {
    return { key: pattern, name: pattern };
  });

  return (
    <div className={styles.filtersBox}>
      <RegroupFilterCategory options={categoryOptions} />
      <RegroupFilterStyle options={styleOptions} />
      <RegroupFilterPattern options={patternOptions} />
    </div>
  );
};

export default RegroupFiltersBox;
