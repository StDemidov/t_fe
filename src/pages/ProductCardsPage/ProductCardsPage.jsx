import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { FaRegFaceSadCry } from 'react-icons/fa6';
import { RiLayoutColumnLine } from 'react-icons/ri';
import { RiLayoutGrid2Fill } from 'react-icons/ri';

import { selectUser } from '../../redux/slices/authSlice';
import {
  fetchProductCards,
  selectCardGroups,
  selectFreeSkus,
  selectIsLoading,
  groupSkusByAbc,
  getCardStats,
  getSkuStats,
  sortSkusByMetric,
  ABC_ORDER,
} from '../../entities/product-card';
import { ProductCardsCanvas } from '../../widgets/product-cards';
import {
  DropdownFilter,
  SwitchFilter,
  SearchFilter,
  SortSelect,
} from '../../shared/ui';

import '../../app/styles/global.css';
import styles from './ProductCardsPage.module.css';

/** Поля агрегатов карточки из getCardStats для сортировки по метрике. */
const CARD_SORT_FIELDS = {
  orders: 'totalOrders',
  clicks: 'totalClicks',
  ads: 'totalAdsCosts',
  drr: 'drr',
};

/** Варианты сортировки карточек по метрикам общего блока (направление — часть значения). */
const cardSortOptions = [
  { value: 'abc:desc', label: 'АВС' },
  { value: 'abc:asc', label: 'АВС' },
  { value: 'clicks:desc', label: 'Клики' },
  { value: 'clicks:asc', label: 'Клики' },
  { value: 'orders:desc', label: 'Заказы' },
  { value: 'orders:asc', label: 'Заказы' },
  { value: 'ads:desc', label: 'Рекламные расходы' },
  { value: 'ads:asc', label: 'Рекламные расходы' },
  { value: 'drr:desc', label: 'ДРР' },
  { value: 'drr:asc', label: 'ДРР' },
];

/** Варианты сортировки артикулов внутри карточки. */
const skuSortOptions = [
  { value: 'abc:desc', label: 'АВС' },
  { value: 'abc:asc', label: 'АВС' },
  { value: 'stocks:desc', label: 'Остатки' },
  { value: 'stocks:asc', label: 'Остатки' },
  { value: 'clicks:desc', label: 'Клики' },
  { value: 'clicks:asc', label: 'Клики' },
  { value: 'orders:desc', label: 'Заказы' },
  { value: 'orders:asc', label: 'Заказы' },
  { value: 'ads:desc', label: 'РР' },
  { value: 'ads:asc', label: 'РР' },
  { value: 'crCart:desc', label: 'CR корз' },
  { value: 'crCart:asc', label: 'CR корз' },
];

/** Совпадение с поиском: по sku или vendorcode, без учёта регистра. */
const matchesSkuSearch = (sku, queryLower) =>
  String(sku.sku).toLowerCase().includes(queryLower) ||
  String(sku.vendorcode).toLowerCase().includes(queryLower);

const ProductCardsPage = () => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const groups = useSelector(selectCardGroups);
  const freeSkus = useSelector(selectFreeSkus);
  const isLoading = useSelector(selectIsLoading);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [showFreeProducts, setShowFreeProducts] = useState(false);
  const [showEmptyCards, setShowEmptyCards] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [cardSort, setCardSort] = useState('clicks:desc');
  const [skuSort, setSkuSort] = useState('clicks:desc');

  const loading = isLoading && groups.length === 0;

  const selectedSet = useMemo(
    () => new Set(selectedCategories),
    [selectedCategories]
  );

  // Список категорий по всем товарам карточек, отсортированный по алфавиту.
  const categories = useMemo(() => {
    const set = new Set();
    for (const group of groups) {
      for (const sku of group.skus) {
        if (sku.category) set.add(sku.category);
      }
    }
    return [...set].sort((a, b) =>
      a.localeCompare(b, 'ru', { sensitivity: 'base' })
    );
  }, [groups]);

  // Оставляем только карточки, у которых есть хотя бы один товар из выбранных
  // категорий и совпадение с поиском (по sku или vendorcode, без учёта регистра).
  const filteredGroups = useMemo(() => {
    let result = groups;
    if (selectedCategories.length > 0) {
      result = result.filter((group) =>
        group.skus.some((sku) => selectedSet.has(sku.category))
      );
    }
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      result = result.filter((group) =>
        group.skus.some((sku) => matchesSkuSearch(sku, queryLower))
      );
    }
    return result;
  }, [groups, selectedCategories, selectedSet, searchQuery]);

  // Отфильтрованные карточки сортируем по выбранной метрике (и направлению).
  const sortedGroups = useMemo(() => {
    const [metric, direction] = cardSort.split(':');
    const sign = direction === 'asc' ? 1 : -1;
    if (metric === 'abc') {
      // АВС карточки = лучшая категория среди её товаров.
      // «Убывание» = лучшие категории первыми: AAA, A, B, C, NEW.
      const abcRank = (abc) => {
        const index = ABC_ORDER.indexOf(abc);
        return index === -1 ? ABC_ORDER.length : index;
      };
      const bestRank = (group) =>
        Math.min(...group.skus.map((sku) => abcRank(sku.abc)));
      const abcSign = direction === 'desc' ? 1 : -1;
      return [...filteredGroups].sort(
        (a, b) => abcSign * (bestRank(a) - bestRank(b))
      );
    }
    const field = CARD_SORT_FIELDS[metric];
    return [...filteredGroups].sort((a, b) => {
      const valueA = Number(getCardStats(a.skus)[field]) || 0;
      const valueB = Number(getCardStats(b.skus)[field]) || 0;
      return sign * (valueA - valueB);
    });
  }, [filteredGroups, cardSort]);

  // Свободные товары фильтруются по тем же категориям и поиску, сортируются
  // по той же сортировке артикулов. Статистика нужна для блоков статы в доке.
  const freeGroups = useMemo(() => {
    let filtered =
      selectedCategories.length === 0
        ? freeSkus
        : freeSkus.filter((sku) => selectedSet.has(sku.category));
    if (searchQuery) {
      const queryLower = searchQuery.toLowerCase();
      filtered = filtered.filter((sku) => matchesSkuSearch(sku, queryLower));
    }
    const rows = filtered.map((sku) => ({ ...sku, stats: getSkuStats(sku) }));
    return groupSkusByAbc(rows).map((group) => ({
      ...group,
      skus: sortSkusByMetric(group.skus, skuSort),
    }));
  }, [freeSkus, selectedCategories, selectedSet, searchQuery, skuSort]);

  // Нечего отображать: свободные скрыты (или пусты) и нет ни одной видимой карточки.
  const isEmpty = useMemo(() => {
    if (showFreeProducts && freeGroups.length > 0) return false;
    if (filteredGroups.length === 0) return true;
    if (showEmptyCards) return false;
    return !filteredGroups.some(
      (group) => getCardStats(group.skus).totalStock > 0
    );
  }, [filteredGroups, freeGroups, showFreeProducts, showEmptyCards]);

  useEffect(() => {
    dispatch(fetchProductCards());
  }, [dispatch]);

  if (
    user?.permissions?.is_admin !== true &&
    user?.permissions?.vendorcodes !== true
  ) {
    return (
      <div className={`page ${styles.root}`}>
        <p className={styles.forbidden}>Для доступа не достаточно прав.</p>
      </div>
    );
  }

  return (
    <div className={`page ${styles.root}`}>
      <header className="pageHeader">
        <h1 className="pageTitle">Карточки товаров</h1>
      </header>

      <div className={styles.filtersRow}>
        <SearchFilter
          placeholder="Поиск по артикулу…"
          onSearch={setSearchQuery}
          disabled={loading}
        />
        <DropdownFilter
          title="Категории"
          mode="multiple"
          options={categories.map((category) => ({
            value: category,
            label: category,
          }))}
          selected={selectedCategories}
          onApply={setSelectedCategories}
          disabled={loading}
        />

        <SwitchFilter
          label="Свободные товары"
          defaultChecked={false}
          checked={showFreeProducts}
          onChange={setShowFreeProducts}
          disabled={loading}
        />
        <SwitchFilter
          label="Карточки без остатков"
          defaultChecked={false}
          checked={showEmptyCards}
          onChange={setShowEmptyCards}
          disabled={loading}
        />
        <SortSelect
          label={
            <span className={styles.sorterCaption}>
              <RiLayoutColumnLine />
            </span>
          }
          options={cardSortOptions}
          value={cardSort}
          onChange={setCardSort}
          disabled={loading}
        />
        <SortSelect
          label={
            <span className={styles.sorterCaption}>
              <RiLayoutGrid2Fill />
            </span>
          }
          options={skuSortOptions}
          value={skuSort}
          onChange={setSkuSort}
          disabled={loading}
        />
      </div>

      <div className={styles.canvasArea}>
        {loading ? (
          <div className={styles.skeleton} />
        ) : isEmpty ? (
          <div className={styles.emptyState}>
            <FaRegFaceSadCry className={styles.emptyIcon} />
            <p className={styles.emptyText}>Мы не смогли ничего найти...</p>
          </div>
        ) : (
          <ProductCardsCanvas
            groups={sortedGroups}
            freeGroups={freeGroups}
            showFreeProducts={showFreeProducts}
            showEmptyCards={showEmptyCards}
            skuSort={skuSort}
          />
        )}
      </div>
    </div>
  );
};

export default ProductCardsPage;
