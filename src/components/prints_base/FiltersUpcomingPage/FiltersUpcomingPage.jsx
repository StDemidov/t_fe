import CategoryFilter from './filters/CategoryFilter';
import CountryFilter from './filters/CountryFilter';
import PatternFilter from './filters/PatternFilter';
import PrintsBaseSorting from './filters/PrintsBaseSorting';
import styles from './style.module.css';

const FiltersUpcomingPage = ({
  items,
  filteredItems,
  count,
  forOrders = false,
}) => {
  let categoryOptions = [];
  let patternOptions = [];
  const countryOptions = [
    {
      key: 'uz',
      name: 'Узбекистан',
    },
    {
      key: 'ru',
      name: 'Россия',
    },
  ];
  if (!forOrders) {
    let categoryOptionsRaw = items.map((item) => {
      return item.category_name;
    });
    categoryOptionsRaw = [...new Set(categoryOptionsRaw)];
    categoryOptions = categoryOptionsRaw.map((category) => {
      return { key: category, name: category };
    });

    let patternOptionsRaw = filteredItems.map((item) => {
      return item.pattern_data.pattern_name;
    });
    patternOptionsRaw = [...new Set(patternOptionsRaw)];
    patternOptions = patternOptionsRaw.map((pattern) => {
      return { key: pattern, name: pattern };
    });
  } else {
    let categoryOptionsRaw = items.map((item) => {
      return item.category_name;
    });
    categoryOptionsRaw = [...new Set(categoryOptionsRaw)];
    categoryOptions = categoryOptionsRaw.map((category) => {
      return { key: category, name: category };
    });

    let patternOptionsRaw = filteredItems.map((item) => {
      return item.pattern_name;
    });
    patternOptionsRaw = [...new Set(patternOptionsRaw)];
    patternOptions = patternOptionsRaw.map((pattern) => {
      return { key: pattern, name: pattern };
    });
  }

  return (
    <div className={styles.filtersMainDiv}>
      <div className={styles.count}>Артикулов: {count}</div>
      <CategoryFilter options={categoryOptions} forOrders={forOrders} />
      <PatternFilter options={patternOptions} forOrders={forOrders} />
      <CountryFilter options={countryOptions} forOrders={forOrders} />
      <PrintsBaseSorting forOrders={forOrders} />
    </div>
  );
};

export default FiltersUpcomingPage;
