import styles from './AbTestsPagination.module.css';

/**
 * Пагинация A/B тестов — повторяет виджет пагинатора страницы «Расчет дозаказов»
 * (выбор размера страницы, диапазон строк, переходы по страницам).
 *
 * @param {object} props
 * @param {number} props.currentPage текущая страница (с 1)
 * @param {number} props.totalPages всего страниц
 * @param {number} props.totalCount всего тестов
 * @param {number} props.pageSize размер страницы
 * @param {number[]} props.pageSizeOptions варианты размера страницы
 * @param {(page: number) => void} props.onPageChange
 * @param {(size: number) => void} props.onPageSizeChange
 */
const AbTestsPagination = ({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  pageSizeOptions,
  onPageChange,
  onPageSizeChange,
}) => {
  const firstRow = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastRow = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className={styles.pagination}>
      <select
        className={styles.pageSize}
        value={pageSize}
        onChange={(e) => {
          onPageSizeChange(Number(e.target.value));
          onPageChange(1);
        }}
      >
        {pageSizeOptions.map((size) => (
          <option key={size} value={size}>
            {size}
          </option>
        ))}
      </select>

      <span className={styles.pageInfo}>
        {totalCount === 0
          ? '0 строк'
          : `${firstRow}–${lastRow} из ${totalCount}`}
      </span>

      <div className={styles.pageButtons}>
        <button
          type="button"
          className={styles.pageButton}
          title="На первую страницу"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(1)}
        >
          «
        </button>
        <button
          type="button"
          className={styles.pageButton}
          title="На предыдущую страницу"
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
        >
          ‹
        </button>

        <span className={styles.pageNumber}>
          {currentPage} / {totalPages}
        </span>

        <button
          type="button"
          className={styles.pageButton}
          title="На следующую страницу"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
        >
          ›
        </button>
        <button
          type="button"
          className={styles.pageButton}
          title="На последнюю страницу"
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(totalPages)}
        >
          »
        </button>
      </div>
    </div>
  );
};

export default AbTestsPagination;