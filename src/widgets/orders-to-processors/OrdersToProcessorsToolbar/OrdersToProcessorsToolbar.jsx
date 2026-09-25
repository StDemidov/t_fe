import React from 'react';
import { MdFilterAltOff } from 'react-icons/md';
import {
  DateRangePicker,
  SearchFilter,
  SortSelect,
  DropdownFilter,
  SwitchFilter,
} from '../../../shared/ui';
import { SORTING_OPTIONS, PAGE_SIZE_OPTIONS } from '../lib/gantt';
import styles from './OrdersToProcessorsToolbar.module.css';

// Максимально допустимая дата календаря — всегда вчерашний день.
const getYesterday = () => {
  const d = new Date();
  d.setDate(d.getDate() - 1);
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};

const OrdersToProcessorsToolbar = ({
  // Dates
  date,
  onDateRangeChange,
  // Search & sort
  onSearch,
  sortValue,
  onSortChange,
  // Filters
  categories,
  onCategoriesChange,
  tagsMain,
  onTagsMainChange,
  tagsCloth,
  onTagsClothChange,
  tagsOther,
  onTagsOtherChange,
  patterns,
  onPatternsChange,
  countries,
  onCountriesChange,
  abcAll,
  onAbcAllChange,
  abcCat,
  onAbcCatChange,
  onlyFilled,
  onOnlyFilledChange,
  orderNames,
  onOrderNamesChange,
  // Options
  optionCategories,
  optionTagsMain,
  optionTagsCloth,
  optionTagsOther,
  optionPatterns,
  optionCountries,
  optionAbcAll,
  optionAbcCat,
  optionOrderNames,
  // Actions
  onResetDates,
  hasDates,
  onResetOrders,
  hasOrders,
  onResetFilters,
  searchResetKey,
  onExportXls,
  // Pagination
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageSizeChange,
  onPageChange,
  disabled = false,
}) => {
  const go = (page) => onPageChange(page);
  const firstRow = totalCount === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const lastRow = Math.min(currentPage * pageSize, totalCount);

  return (
    <div className={styles.toolbar}>
      <div className={styles.pagination}>
        <select
          className={styles.pageSize}
          value={pageSize}
          onChange={(e) => {
            onPageSizeChange(Number(e.target.value));
            onPageChange(1);
          }}
        >
          {PAGE_SIZE_OPTIONS.map((size) => (
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
            onClick={() => go(1)}
          >
            «
          </button>
          <button
            type="button"
            className={styles.pageButton}
            title="На предыдущую страницу"
            disabled={currentPage <= 1}
            onClick={() => go(currentPage - 1)}
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
            onClick={() => go(currentPage + 1)}
          >
            ›
          </button>
          <button
            type="button"
            className={styles.pageButton}
            title="На последнюю страницу"
            disabled={currentPage >= totalPages}
            onClick={() => go(totalPages)}
          >
            »
          </button>
        </div>
      </div>

      <div className={styles.filtersRow}>
        <div className={styles.filtersGroup}>
          <button
            type="button"
            className={styles.resetFiltersBtn}
            title="Сбросить все фильтры"
            onClick={onResetFilters}
            disabled={disabled}
          >
            <MdFilterAltOff />
          </button>
          <DateRangePicker
            value={date}
            onChange={onDateRangeChange}
            maxDate={getYesterday()}
            disabled={disabled}
          />
          <SortSelect
            options={SORTING_OPTIONS}
            value={sortValue}
            onChange={onSortChange}
            disabled={disabled}
          />
          <SearchFilter
            key={searchResetKey}
            placeholder="Поиск по артикулу…"
            onSearch={onSearch}
            disabled={disabled}
          />
          <DropdownFilter
            title="Категория"
            options={optionCategories}
            selected={categories}
            onApply={onCategoriesChange}
            disabled={disabled}
          />
          <DropdownFilter
            title="Теги"
            options={optionTagsMain}
            selected={tagsMain}
            onApply={onTagsMainChange}
            disabled={disabled}
          />
          <DropdownFilter
            title="Теги (ткань)"
            options={optionTagsCloth}
            selected={tagsCloth}
            onApply={onTagsClothChange}
            disabled={disabled}
          />
          <DropdownFilter
            title="Теги (доп)"
            options={optionTagsOther}
            selected={tagsOther}
            onApply={onTagsOtherChange}
            disabled={disabled}
          />
          <DropdownFilter
            title="Лекало"
            options={optionPatterns}
            selected={patterns}
            onApply={onPatternsChange}
            disabled={disabled}
          />
          <DropdownFilter
            title="Страна"
            options={optionCountries}
            selected={countries}
            onApply={onCountriesChange}
            disabled={disabled}
          />
          <DropdownFilter
            title="АВС (Бренд)"
            options={optionAbcAll}
            selected={abcAll}
            onApply={onAbcAllChange}
            disabled={disabled}
          />
          <DropdownFilter
            title="АВС (Категория)"
            options={optionAbcCat}
            selected={abcCat}
            onApply={onAbcCatChange}
            disabled={disabled}
          />
          <DropdownFilter
            title="Заказ"
            options={optionOrderNames}
            selected={orderNames}
            onApply={onOrderNamesChange}
            disabled={disabled}
          />
          <SwitchFilter
            label="Только заполненные"
            checked={onlyFilled}
            onChange={onOnlyFilledChange}
            disabled={disabled}
          />
        </div>

        <div className={styles.actionsGroup}>
          <button
            className={styles.actionBtnReset}
            onClick={onResetDates}
            disabled={!hasDates}
          >
            Сбросить даты
          </button>
          <button
            className={styles.actionBtnReset}
            onClick={onResetOrders}
            disabled={!hasOrders}
          >
            Сбросить заказы
          </button>
          <button className={styles.actionBtnSecondary} onClick={onExportXls} disabled={disabled}>
            Сформировать
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrdersToProcessorsToolbar;