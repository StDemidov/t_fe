import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { TiFilter } from 'react-icons/ti';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectTagsMain,
  selectTagsCloth,
  selectTagsOthers,
  linkTagsToSkus,
  unlinkTagsFromSkus,
} from '../../entities/tags';
import { addSkuTag, removeSkuTag } from '../../entities/sku-metrics';
import { selectUser } from '../../redux/slices/authSlice';
import styles from './TagsCell.module.css';

/** Права доступа для управления тегами (добавление/удаление). */
const canManageTags = (user) =>
  user?.permissions?.is_admin === true ||
  user?.permissions?.tags_create === true;

/** Выбор селектора списка всех тегов по типу категории. */
const SELECTORS_BY_TYPE = {
  main: selectTagsMain,
  cloth: selectTagsCloth,
  others: selectTagsOthers,
};

/** Поле в данных артикула по типу тега. */
const FIELD_BY_TYPE = {
  main: 'mainTags',
  cloth: 'clothTags',
  others: 'otherTags',
};

/**
 * Ячейка списка тегов артикула.
 *
 * Теги выводятся плашками (без запятых), по центру ячейки по вертикали,
 * выровнены по горизонтали от левого края. Тегов может быть много, поэтому
 * контент прокручивается по вертикали (полоса скролла скрыта). Теги могут
 * переноситься — несколько помещаются в одну строку.
 *
 * Первая в списке — иконка «плюс»: открывает выпадающий список всех тегов
 * данного типа, которые ещё не привязаны к артикулу. Можно отметить нужные и
 * нажать «Применить» — теги позитивно привязываются и отправляется запрос
 * link_tags_to_skus. При ошибке привязка откатывается. У каждого тега справа
 * значок «крестик» для удаления (unlink_tags_to_skus, позитивно с откатом).
 *
 * @param {object} props
 * @param {string[]} props.tags — теги артикула в данной категории
 * @param {string|number} props.sku — идентификатор артикула
 * @param {string} props.type — тип тега: 'main' | 'cloth' | 'others'
 * @param {React.RefObject} [props.scrollLockRef] — контейнер таблицы, прокрутку
 *   которого нужно блокировать, пока открыто меню тегов.
 * @param {(tag: string, type: string) => void} [props.onTagFilter] — вызывает
 *   выставление тега в качестве фильтра.
 */
const TagsCell = ({ tags = [], sku, type, scrollLockRef, onTagFilter }) => {
  const dispatch = useDispatch();
  const user = useSelector(selectUser);
  const manageAllowed = canManageTags(user);
  const [list, setList] = useState(tags);
  const allTags = useSelector(SELECTORS_BY_TYPE[type] || selectTagsMain);
  const field = FIELD_BY_TYPE[type] || 'mainTags';

  // Синхронизация локального списка с данными артикула (после привязки/отвязки,
  // чтобы фильтры и таблица работали с единым источником истины).
  useEffect(() => {
    setList(tags);
  }, [tags]);

  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState(new Set());
  const [query, setQuery] = useState('');
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const addRef = useRef(null);
  const popoverRef = useRef(null);

  // Список тегов, доступных для привязки (ещё не привязаны к артикулу).
  const available = (allTags || []).filter((tag) => !list.includes(tag));

  // Лайв-фильтр по строке поиска (без учёта регистра).
  const trimmedQuery = query.trim().toLowerCase();
  const filteredAvailable = trimmedQuery
    ? available.filter((tag) => String(tag).toLowerCase().includes(trimmedQuery))
    : available;

  const openDropdown = () => {
    const rect = addRef.current?.getBoundingClientRect();
    if (rect) {
      setPos({
        top: rect.bottom + 4 + window.scrollY,
        left: rect.left + window.scrollX,
      });
    }
    setSelected(new Set());
    setQuery('');
    setOpen(true);
  };

  const toggleSelect = (tag) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(tag)) next.delete(tag);
      else next.add(tag);
      return next;
    });
  };

  const apply = async () => {
    const chosen = [...selected];
    if (chosen.length === 0) {
      setOpen(false);
      return;
    }
    // Позитивная привязка: добавляем теги сразу.
    setList((prev) => [...new Set([...prev, ...chosen])]);
    setOpen(false);
    try {
      const failed = await linkTagsToSkus(
        chosen.map((tag) => ({
          tag_name: tag,
          type,
          skus_list: [String(sku)],
        }))
      );
      // Ошибка: вернулись не привязанные теги — убираем их обратно.
      if (Array.isArray(failed) && failed.length > 0) {
        const failedNames = new Set(failed.map((f) => f.tag_name));
        setList((prev) => prev.filter((t) => !failedNames.has(t)));
      } else {
        // Успех: синхронизируем теги артикула в хранилище.
        chosen.forEach((tag) => dispatch(addSkuTag({ sku, field, tag })));
      }
    } catch {
      setList((prev) => prev.filter((t) => !chosen.includes(t)));
    }
  };

  // Закрытие попапа по клику вне его и по Escape.
  useEffect(() => {
    if (!open) return undefined;
    // Блокировка внешней и табличной прокрутки, пока открыто меню тегов.
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const table = scrollLockRef?.current;
    const originalTableOverflow = table ? table.style.overflow : null;
    if (table) table.style.overflow = 'hidden';
    const onDocClick = (e) => {
      if (
        popoverRef.current &&
        !popoverRef.current.contains(e.target) &&
        addRef.current &&
        !addRef.current.contains(e.target)
      ) {
        setOpen(false);
      }
    };
    const onKey = (e) => {
      if (e.key === 'Escape') setOpen(false);
    };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = originalOverflow;
      if (table) table.style.overflow = originalTableOverflow;
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  const handleRemove = async (tag) => {
    setList((prev) => prev.filter((t) => t !== tag));
    try {
      const failed = await unlinkTagsFromSkus([
        { tag_name: tag, type, skus_list: [String(sku)] },
      ]);
      if (Array.isArray(failed) && failed.length > 0) {
        setList((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
      } else {
        dispatch(removeSkuTag({ sku, field, tag }));
      }
    } catch {
      setList((prev) => (prev.includes(tag) ? prev : [...prev, tag]));
    }
  };

  return (
    <div className={styles.scroll}>
      <div className={styles.list}>
        {manageAllowed && (
          <button
            type="button"
            ref={addRef}
            className={styles.chipAdd}
            title="Добавить тег"
            onClick={openDropdown}
          >
            +
          </button>
        )}
        {list.map((tag, index) => (
          <span key={index} className={styles.chip}>
            <button
              type="button"
              className={styles.chipRemove}
              title="Удалить тег"
              aria-label={`Удалить тег ${tag}`}
              onClick={() => handleRemove(tag)}
            >
              ×
            </button>
            <span className={styles.chipLabel}>{String(tag).toUpperCase()}</span>
            {onTagFilter && (
              <button
                type="button"
                className={styles.chipFilter}
                title="Фильтровать по тегу"
                aria-label={`Фильтровать по тегу ${tag}`}
                onClick={() => onTagFilter(tag, type)}
              >
                <TiFilter />
              </button>
            )}
          </span>
        ))}
      </div>

      {open &&
        createPortal(
          <div
            ref={popoverRef}
            className={styles.dropdown}
            style={{ top: pos.top, left: pos.left }}
          >
            <div className={styles.dropdownTitle}>Добавить теги</div>
            <input
              type="text"
              className={styles.dropdownSearch}
              placeholder="Поиск тегов…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <div className={styles.dropdownList}>
              {filteredAvailable.length === 0 ? (
                <div className={styles.dropdownEmpty}>
                  {trimmedQuery ? 'Ничего не найдено' : 'Нет доступных тегов'}
                </div>
              ) : (
                filteredAvailable.map((tag) => (
                  <label key={tag} className={styles.dropdownItem}>
                    <input
                      type="checkbox"
                      checked={selected.has(tag)}
                      onChange={() => toggleSelect(tag)}
                    />
                    <span>{String(tag)}</span>
                  </label>
                ))
              )}
            </div>
            <div className={styles.dropdownActions}>
              <button
                type="button"
                className={styles.dropdownApply}
                onClick={apply}
                disabled={selected.size === 0}
              >
                Применить
              </button>
              <button
                type="button"
                className={styles.dropdownCancel}
                onClick={() => setOpen(false)}
              >
                Отмена
              </button>
            </div>
          </div>,
          document.body
        )}
    </div>
  );
};

export default TagsCell;
