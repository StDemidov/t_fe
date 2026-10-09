import { FiRefreshCw } from 'react-icons/fi';
import { SearchFilter, DropdownFilter } from '../../../shared/ui';
import { getAbTestStatusOptions } from '../lib/abTestStatuses';
import styles from './AbTestsToolbar.module.css';

/**
 * Блок фильтров A/B тестов.
 *
 * Слева от поиска — кнопка обновления раздела: заново запрашивает тесты
 * текущей вкладки, на время запроса таблица показывает скелетон.
 * Поиск по артикулу (SKU или vendorCode) одинаков для всех разделов.
 * Фильтр по статусу есть только в разделе «В обработке» — статус
 * принадлежит этапу подготовки теста, в остальных разделах его нет.
 *
 * @param {object} props
 * @param {() => void} props.onRefresh перезабрать данные текущего раздела
 * @param {(query: string) => void} props.onSearch поиск по Enter или клику на лупу
 * @param {boolean} props.showStatusFilter показывать ли фильтр по статусу
 * @param {Array<string>} props.statuses выбранные коды статусов
 * @param {(values: Array<string>) => void} props.onStatusFilter применение фильтра
 */
const AbTestsToolbar = ({
  onRefresh,
  onSearch,
  showStatusFilter = false,
  statuses = [],
  onStatusFilter,
}) => (
  <div className={styles.toolbar}>
    <button
      type="button"
      className={styles.refreshBtn}
      title="Обновить раздел"
      aria-label="Обновить раздел"
      onClick={onRefresh}
    >
      <FiRefreshCw />
    </button>
    <SearchFilter
      placeholder="Поиск по артикулу…"
      onSearch={onSearch}
    />
    {showStatusFilter && (
      <DropdownFilter
        title="Статус"
        mode="multiple"
        options={getAbTestStatusOptions()}
        selected={statuses}
        onApply={onStatusFilter}
      />
    )}
  </div>
);

export default AbTestsToolbar;