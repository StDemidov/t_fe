import styles from './CategoryFilter.module.css';

/**
 * CategoryFilter — выпадающий список категорий с кнопкой сброса.
 * categories: string[] — отсортированный список значений
 * value: string       — текущий выбор (''' = Всего)
 * onChange: (v) => void
 */
const CategoryFilter = ({ categories = [], value = '', onChange }) => {
  const hasValue = value !== '';

  return (
    <div className={styles.wrap}>
      {/* Кнопка сброса — слева от select, появляется только при выбранной категории */}
      {hasValue && (
        <button
          type="button"
          className={styles.resetBtn}
          onClick={() => onChange('')}
          title="Сбросить фильтр"
        >
          ✕
        </button>
      )}

      <div className={styles.selectWrap}>
        <select
          className={styles.select}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        >
          <option value="">Все категории</option>
          {categories.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default CategoryFilter;
