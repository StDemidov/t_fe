import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import { FaEraser } from 'react-icons/fa6';
import * as XLSX from 'xlsx';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectTagsMain,
  selectTagsCloth,
  selectTagsOthers,
  deleteTags,
  removeTagsFromPool,
  createTag,
  addTagsToPool,
  linkTagsToSkus,
} from '../../../entities/tags';
import { addSkuTag, removeSkuTags } from '../../../entities/sku-metrics';
import styles from './TagsManagerModal.module.css';

const TABS = [
  { id: 'create', label: 'Создание тегов' },
  { id: 'remove', label: 'Удаление тегов' },
  { id: 'xlsx', label: 'Привязка тегов через XLSX' },
];

// Типы тегов: label — подпись в выпадающем списке, key — ключ для запроса.
const TAG_TYPES = [
  { key: 'main', label: 'Основной' },
  { key: 'cloth', label: 'Ткань' },
  { key: 'others', label: 'Дополнительный' },
];

// Селектор списка всех тегов по типу.
const TAGS_SELECTORS = {
  main: selectTagsMain,
  cloth: selectTagsCloth,
  others: selectTagsOthers,
};

// Поле в данных артикула по типу тега.
const FIELD_BY_TYPE = {
  main: 'mainTags',
  cloth: 'clothTags',
  others: 'otherTags',
};

/**
 * Модальное окно управления тегами, открываемое по центру экрана.
 *
 * Имеет два раздела — «Создание тегов» и «Удаление тегов», наполнение
 * которых меняется при переключении вкладок. В разделе «Создание тегов»:
 * инструкция, поле ввода названия (Enter превращает текст в плашку — слот тега
 * с крестиком для удаления), выбор типа тега и кнопка «Создать» (пока выводит
 * теги в консоль). Пока окно открыто, внешний скролл блокируется,
 * а клавиша Escape закрывает окно.
 *
 * @param {object} props
 * @param {boolean} props.open — открыто ли окно
 * @param {() => void} props.onClose — закрытие окна
 * @param {Array<{ tag_name: string, type: string }>} [props.onTagsRemoved] —
 *   успешно удалённые теги (нужно странице, чтобы почистить фильтры)
 * @param {string[]} [props.skuList] — список артикулов (SKU) на странице;
 *   нужен для проверки SKU в разделе «Привязка тегов через XLSX»
 */
const TagsManagerModal = ({
  open = false,
  onClose,
  onTagsRemoved,
  skuList = [],
}) => {
  const dispatch = useDispatch();
  const [tab, setTab] = useState('create');
  const [input, setInput] = useState('');
  const [tags, setTags] = useState([]);
  const [type, setType] = useState(TAG_TYPES[0].key);
  const [typeOpen, setTypeOpen] = useState(false);
  const inputRef = useRef(null);

  // Состояние раздела «Удаление тегов».
  const [remType, setRemType] = useState(TAG_TYPES[0].key);
  const [remTypeOpen, setRemTypeOpen] = useState(false);
  const [remQuery, setRemQuery] = useState('');
  // Идёт ли сейчас запрос на удаление (кнопка блокируется).
  const [isDeleting, setIsDeleting] = useState(false);

  // Тосты: успех слева внизу, ошибка справа. Появляются и уползают сами.
  const [toast, setToast] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);

  // Отмеченные на удаление теги. Ключ — `${type}::${name}`, поэтому отметки
  // сохраняются при переключении типа и собираются по всем типам сразу.
  const [marked, setMarked] = useState(new Set());

  const markKey = (type_, name) => `${type_}::${name}`;

  // Состояние раздела «Привязка тегов через XLSX».
  const [xlsxType, setXlsxType] = useState(TAG_TYPES[0].key);
  const [xlsxTypeOpen, setXlsxTypeOpen] = useState(false);
  const [xlsxFile, setXlsxFile] = useState(null);
  const [checkInfo, setCheckInfo] = useState(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isBinding, setIsBinding] = useState(false);
  const fileInputRef = useRef(null);

  // Селектор списка всех тегов по типу.
  const allTags = useSelector(TAGS_SELECTORS[remType] || selectTagsMain) || [];

  // Пул тегов выбранного типа для XLSX (для проверки «тегов которых нет»).
  const xlsxPoolTags =
    useSelector(
      xlsxType === 'main'
        ? selectTagsMain
        : xlsxType === 'cloth'
        ? selectTagsCloth
        : selectTagsOthers
    ) || [];

  // Лайв-фильтр по строке поиска (без учёта регистра). Нормализуем значения
  // в строку и убираем дубли, чтобы фильтр был стабильным при любых данных.
  const trimmedRemQuery = remQuery.trim().toLowerCase();
  const filteredTags = useMemo(() => {
    const tags = trimmedRemQuery
      ? allTags.filter((tag) =>
          String(tag ?? '')
            .toLowerCase()
            .includes(trimmedRemQuery)
        )
      : allTags;
    return [...new Set(tags.map((tag) => String(tag ?? '')))];
  }, [allTags, trimmedRemQuery]);

  const toggleMark = (name) => {
    const key = markKey(remType, name);
    setMarked((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  // Показ тоста: выплывает слева внизу (успех) или справа (ошибка),
  // затем уползает обратно.
  useEffect(() => {
    if (!toast) return;
    const raf = requestAnimationFrame(() => setToastVisible(true));
    const hideTimer = setTimeout(() => setToastVisible(false), 2400);
    const clearTimer = setTimeout(() => {
      setToast(null);
      setToastVisible(false);
    }, 2900);
    return () => {
      cancelAnimationFrame(raf);
      clearTimeout(hideTimer);
      clearTimeout(clearTimer);
    };
  }, [toast]);

  const handleRemove = async () => {
    if (marked.size === 0 || isDeleting) return;
    // Собираем все отмеченные теги независимо от текущего типа.
    const list = [...marked].map((key) => {
      const [type_, ...rest] = key.split('::');
      return { tag_name: rest.join('::'), type: type_ };
    });
    const keyOf = (tag_name, type) => `${type}::${tag_name}`;

    setIsDeleting(true);
    try {
      // Ответ сервера: пустой список — всё удалено; иначе — теги, которые
      // удалить не удалось.
      const failed = await deleteTags(list);
      const failedKeys = new Set(
        (failed || []).map((f) => keyOf(String(f.tag_name), f.type))
      );
      const removed = list.filter((p) => !failedKeys.has(keyOf(p.tag_name, p.type)));

      // Очищаем пул и артикулы от успешно удалённых тегов.
      if (removed.length > 0) {
        dispatch(removeTagsFromPool(removed));
        dispatch(removeSkuTags(removed));
        onTagsRemoved?.(removed);
      }

      if (failed.length === 0) {
        // Все выделения снимаем — теги удалены из пула.
        setMarked(new Set());
        setToast({ kind: 'success', text: 'Теги успешно удалены' });
      } else {
        // Неудавшиеся теги остаются отмеченными.
        setMarked((prev) => new Set([...prev].filter((key) => failedKeys.has(key))));
        setToast({
          kind: 'error',
          text: `Не удалось удалить ${failed.length} тегов`,
        });
      }
    } catch {
      // Сетевая ошибка: ничего не трогаем, выделения сохраняются.
      console.error('Ошибка удаления тегов');
    } finally {
      setIsDeleting(false);
    }
  };

  // Блокируем скролл страницы, пока окно открыто.
  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  // Закрытие по Escape.
  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [open, onClose]);

  // Добавление тега по Enter.
  const addTag = () => {
    const value = input.trim();
    if (!value) return;
    setTags((prev) => (prev.includes(value) ? prev : [...prev, value]));
    setInput('');
  };

  const removeTag = (name) => setTags((prev) => prev.filter((t) => t !== name));

  const handleCreate = async () => {
    if (tags.length === 0) return;
    // Чистим теги: без лишних и краевых пробелов, в lowercase.
    const payload = tags.map((name) => ({
      tag_name: String(name).trim().replace(/\s+/g, ' ').toLowerCase(),
      type,
    }));
    try {
      await createTag(payload);
      // При успехе добавляем теги в пул существующих и очищаем поле.
      dispatch(addTagsToPool(payload));
      setTags([]);
      setToast({ kind: 'success', text: 'Теги успешно созданы' });
    } catch {
      // Ошибка бекенда: поле не трогаем, в пул ничего не добавляем.
      console.error('Ошибка создания тегов');
      setToast({
        kind: 'error',
        text: 'Произошла ошибка при создании, повторите попытку',
      });
    }
  };

  // Снятие отметки с тега по ключу (из сводного списка отмеченных).
  const unmarkKey = (key) => {
    setMarked((prev) => {
      const next = new Set(prev);
      next.delete(key);
      return next;
    });
  };

  // Скачивание шаблона: xlsx с пустыми колонками «SKU» и «Тег».
  const downloadTemplate = () => {
    const sheet = XLSX.utils.aoa_to_sheet([['SKU', 'Тег']]);
    const book = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(book, sheet, 'Шаблон');
    XLSX.writeFile(book, 'template_links.xlsx');
  };

  // Выбор файла XLSX для привязки тегов.
  const onXlsxFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setXlsxFile(file);
    setCheckInfo(null);
    // Разрешаем повторный выбор того же файла после проверки.
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Проверка файла: чистим теги/SKU, отбрасываем неизвестные SKU и дубли,
  // определяем теги, которых нет в выбранной категории.
  const handleCheckFile = async () => {
    if (!xlsxFile) {
      setToast({ kind: 'error', text: 'Выберите файл XLSX' });
      return;
    }
    setIsChecking(true);
    try {
      const buf = await xlsxFile.arrayBuffer();
      const book = XLSX.read(buf, { type: 'array' });
      const sheet = book.Sheets[book.SheetNames[0]];
      const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });

      const validSkus = new Set(skuList.map((s) => String(s)));
      const poolSet = new Set(xlsxPoolTags.map((t) => String(t)));

      // Очистка тега: без сдвоенных и краевых пробелов, в lowercase.
      const cleanTag = (v) =>
        String(v ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
      // Очистка SKU: убрать все пробелы.
      const cleanSku = (v) => String(v ?? '').replace(/\s+/g, '');

      const toCreateSet = new Set();
      const skuByTag = new Map();
      const seenPairs = new Set();
      let validRows = 0;

      rows.forEach((row, i) => {
        if (i === 0) return; // Пропускаем шапку
        const rawSku = row[0];
        const rawTag = row[1];
        const sku = cleanSku(rawSku);
        const tag = cleanTag(rawTag);
        if (!sku || !tag) return; // Пустые строки игнорируем.
        if (!validSkus.has(sku)) return; // Незнакомый SKU игнорируем.
        const pairKey = `${sku}::${tag}`;
        if (seenPairs.has(pairKey)) return; // Повтор пары игнорируем.
        seenPairs.add(pairKey);
        validRows += 1;

        if (!poolSet.has(tag)) toCreateSet.add(tag);
        if (!skuByTag.has(tag)) skuByTag.set(tag, new Set());
        skuByTag.get(tag).add(sku);
      });

      const toCreate = [...toCreateSet].sort();
      const toLink = [...skuByTag.entries()].map(([tag, skus]) => ({
        tag_name: tag,
        type: xlsxType,
        skus_list: [...skus],
      }));

      setCheckInfo({ toCreate, toLink, validRows });
    } catch {
      console.error('Ошибка чтения файла');
      setCheckInfo(null);
      setToast({ kind: 'error', text: 'Не удалось прочитать файл' });
    } finally {
      setIsChecking(false);
    }
  };

  // Привязка тегов: сначала создаём недостающие, затем привязываем.
  const handleBindTags = async () => {
    if (!checkInfo || checkInfo.toLink.length === 0 || isBinding) return;
    setIsBinding(true);
    try {
      // 1) Создаём теги, которых ещё нет в категории.
      if (checkInfo.toCreate.length > 0) {
        const createPayload = checkInfo.toCreate.map((tag_name) => ({
          tag_name,
          type: xlsxType,
        }));
        try {
          await createTag(createPayload);
          dispatch(addTagsToPool(createPayload));
        } catch {
          setToast({
            kind: 'error',
            text: 'Произошла ошибка при создании, повторите попытку',
          });
          return;
        }
      }

      // 2) Привязываем теги к артикулам.
      const failed = await linkTagsToSkus(checkInfo.toLink);
      if (failed && failed.length > 0) {
        setToast({
          kind: 'error',
          text: `Не удалось привязать ${failed.length} тегов`,
        });
        return;
      }
      // Позитивно обновляем теги артикулов и наполняем фильтры.
      const field = FIELD_BY_TYPE[xlsxType] || 'mainTags';
      checkInfo.toLink.forEach(({ tag_name, skus_list }) => {
        (skus_list || []).forEach((sku) =>
          dispatch(addSkuTag({ sku: String(sku), field, tag: tag_name }))
        );
      });
      setToast({ kind: 'success', text: 'Теги успешно привязаны' });
      setCheckInfo(null);
      setXlsxFile(null);
    } catch {
      console.error('Ошибка привязки тегов');
      setToast({ kind: 'error', text: 'Произошла ошибка привязки, повторите попытку' });
    } finally {
      setIsBinding(false);
    }
  };

  // Сброс раздела «Привязка тегов через XLSX» в первоначальное состояние.
  const resetXlsx = () => {
    setXlsxFile(null);
    setCheckInfo(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Все отмеченные на удаление теги из всех категорий для сводного списка.
  const markedList = useMemo(
    () =>
      [...marked].map((key) => {
        const [type_, ...rest] = key.split('::');
        const label = TAG_TYPES.find((t) => t.key === type_)?.label || type_;
        return { key, typeLabel: label, name: rest.join('::') };
      }),
    [marked]
  );

  if (!open) return null;

  const activeTab = TABS.find((t) => t.id === tab);

  return createPortal(
    <>
      <div className={styles.overlay} onMouseDown={onClose}>
        <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <button
            type="button"
            className={styles.closeBtn}
            title="Закрыть"
            aria-label="Закрыть окно"
            onClick={onClose}
          >
            <FaTimes />
          </button>
        </div>
        <div className={styles.tabs}>
          {TABS.map((t) => (
            <button
              type="button"
              key={t.id}
              className={`${styles.tab} ${
                tab === t.id ? styles.tabActive : ''
              }`}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className={styles.content}>
          {tab === 'create' ? (
            <div className={styles.createForm}>
              <p className={styles.instructions}>
                Введите название тега и нажмите Enter — текст превратится в
                плашку. Можно добавить несколько тегов. Крестик на плашке
                удаляет тег. Выберите тип тега и нажмите «Создать».
              </p>

              {/* Тип тега: выпадающий список. */}
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Тип тега</span>
                <div className={styles.typeRoot}>
                  <button
                    type="button"
                    className={styles.typeTrigger}
                    onClick={() => setTypeOpen((o) => !o)}
                  >
                    <span>{TAG_TYPES.find((t) => t.key === type)?.label}</span>
                    <span
                      className={`${styles.typeChevron} ${
                        typeOpen ? styles.typeChevronOpen : ''
                      }`}
                    >
                      ▾
                    </span>
                  </button>
                  {typeOpen && (
                    <div className={styles.typeList}>
                      {TAG_TYPES.map((t) => (
                        <button
                          type="button"
                          key={t.key}
                          className={`${styles.typeOption} ${
                            type === t.key ? styles.typeOptionActive : ''
                          }`}
                          onClick={() => {
                            setType(t.key);
                            setTypeOpen(false);
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Поле ввода новых тегов с плашками. */}
              <div className={styles.field}>
                <div className={styles.fieldHeader}>
                  <span className={styles.fieldLabel}>Введите новые теги</span>
                  <button
                    type="button"
                    className={styles.clearBtn}
                    title="Очистить поле"
                    aria-label="Очистить поле с новыми тегами"
                    onClick={() => setTags([])}
                    disabled={tags.length === 0}
                  >
                    <FaEraser />
                  </button>
                </div>
                <div
                  className={styles.tagInput}
                  onClick={() => inputRef.current?.focus()}
                >
                  {tags.map((name) => (
                    <span key={name} className={styles.tagChip}>
                      <span className={styles.tagChipLabel}>{name}</span>
                      <button
                        type="button"
                        className={styles.tagRemove}
                        title="Удалить тег"
                        aria-label={`Удалить тег ${name}`}
                        onClick={() => removeTag(name)}
                      >
                        ×
                      </button>
                    </span>
                  ))}
                  <input
                    ref={inputRef}
                    className={styles.tagTextInput}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        addTag();
                      }
                    }}
                    placeholder={tags.length ? '' : 'Введите тег…'}
                  />
                </div>
              </div>
            </div>
          ) : tab === 'xlsx' ? (
            <div className={styles.xlsxForm}>
              <p className={styles.instructions}>
                Скачайте{' '}
                <button
                  type="button"
                  className={styles.linkBtn}
                  onClick={downloadTemplate}
                >
                  шаблон
                </button>{' '}
                и заполните его: по строке на пару «SKU → Тег». Загрузите файл,
                выберите тип тегов, нажмите «Проверить файл» — несуществующие SKU
                и повторные строки будут пропущены, а новых тегов появятся в
                списке на создание. Затем нажмите «Привязать теги».
              </p>

              {/* Загрузка файла XLSX. */}
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Файл XLSX</span>
                <label className={styles.fileDrop}>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".xlsx"
                    className={styles.fileInput}
                    onChange={onXlsxFileChange}
                  />
                  <span className={styles.fileDropText}>
                    {xlsxFile ? 'Заменить файл' : 'Выберите файл'}
                  </span>
                </label>
                <div className={styles.fileName}>
                  {xlsxFile ? xlsxFile.name : ''}
                </div>
              </div>

              {/* Тип добавляемых тегов. */}
              <div className={styles.field}>
                <span className={styles.fieldLabel}>Тип добавляемых тегов</span>
                <div className={styles.typeRoot}>
                  <button
                    type="button"
                    className={styles.typeTrigger}
                    onClick={() => setXlsxTypeOpen((o) => !o)}
                  >
                    <span>
                      {TAG_TYPES.find((t) => t.key === xlsxType)?.label}
                    </span>
                    <span
                      className={`${styles.typeChevron} ${
                        xlsxTypeOpen ? styles.typeChevronOpen : ''
                      }`}
                    >
                      ▾
                    </span>
                  </button>
                  {xlsxTypeOpen && (
                    <div className={styles.typeList}>
                      {TAG_TYPES.map((t) => (
                        <button
                          type="button"
                          key={t.key}
                          className={`${styles.typeOption} ${
                            xlsxType === t.key ? styles.typeOptionActive : ''
                          }`}
                          onClick={() => {
                            setXlsxType(t.key);
                            setXlsxTypeOpen(false);
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Проверка файла. */}
              <button
                type="button"
                className={styles.checkBtn}
                onClick={handleCheckFile}
                disabled={!xlsxFile || isChecking}
              >
                {isChecking ? 'Проверка…' : 'Проверить файл'}
              </button>

              {/* Инфа по итогам проверки. */}
              {checkInfo && (
                <div className={styles.checkInfo}>
                  <p className={styles.checkInfoLine}>
                    Обработано строк: {checkInfo.validRows}.
                  </p>
                  {checkInfo.toLink.length === 0 ? (
                    <p className={styles.checkInfoLine}>
                      Нет пар «SKU → Тег» для привязки: строка с несуществующим
                      SKU пропущена. Создание тегов и привязка не выполнятся.
                    </p>
                  ) : checkInfo.toCreate.length > 0 ? (
                    <p className={styles.checkInfoLine}>
                      В файле найдены теги, которых нет в выбранной категории
                      ({checkInfo.toCreate.length}):{' '}
                      {checkInfo.toCreate.map((t) => String(t).toUpperCase()).join(', ')}
                      . Перед привязкой они будут созданы.
                    </p>
                  ) : (
                    <p className={styles.checkInfoLine}>
                      Все теги уже существуют — можно привязывать.
                    </p>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className={styles.removeForm}>
              <p className={styles.instructions}>
                Выберите тип тега — в поле ниже появятся все теги этой
                категории. Клик по плашке отмечает тег на удаление, повторный
                клик снимает отметку. Внизу нажмите «Удалить». Теги
                автоматически отвяжутся от артикулов.
              </p>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>Тип тега</span>
                <div className={styles.typeRoot}>
                  <button
                    type="button"
                    className={styles.typeTrigger}
                    onClick={() => setRemTypeOpen((o) => !o)}
                  >
                    <span>
                      {TAG_TYPES.find((t) => t.key === remType)?.label}
                    </span>
                    <span
                      className={`${styles.typeChevron} ${
                        remTypeOpen ? styles.typeChevronOpen : ''
                      }`}
                    >
                      ▾
                    </span>
                  </button>
                  {remTypeOpen && (
                    <div className={styles.typeList}>
                      {TAG_TYPES.map((t) => (
                        <button
                          type="button"
                          key={t.key}
                          className={`${styles.typeOption} ${
                            remType === t.key ? styles.typeOptionActive : ''
                          }`}
                          onClick={() => {
                            setRemType(t.key);
                            setRemTypeOpen(false);
                          }}
                        >
                          {t.label}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className={styles.field}>
                <div className={styles.fieldHeader}>
                  <span className={styles.fieldLabel}>
                    Выберите теги для удаления
                  </span>
                  <button
                    type="button"
                    className={styles.clearBtn}
                    title="Снять отметки удаления со всех тегов"
                    aria-label="Снять отметки удаления со всех тегов"
                    onClick={() => setMarked(new Set())}
                    disabled={marked.size === 0}
                  >
                    <FaEraser />
                  </button>
                </div>
                <input
                  type="text"
                  className={styles.remSearch}
                  placeholder="Поиск тегов…"
                  value={remQuery}
                  onChange={(e) => setRemQuery(e.target.value)}
                />
                <div className={styles.remTagsBox}>
                  {filteredTags.length === 0 ? (
                    <div className={styles.remEmpty}>
                      {trimmedRemQuery
                        ? 'Ничего не найдено'
                        : 'Нет тегов этого типа'}
                    </div>
                  ) : (
                    filteredTags.map((tag) => {
                      const isMarked = marked.has(markKey(remType, tag));
                      return (
                        <button
                          type="button"
                          key={tag}
                          className={`${styles.remChip} ${
                            isMarked ? styles.remChipMarked : ''
                          }`}
                          onClick={() => toggleMark(tag)}
                        >
                          <span className={styles.remChipLabel}>
                            {String(tag).toUpperCase()}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </div>

              <div className={styles.field}>
                <span className={styles.fieldLabel}>
                  Отмечено на удаление ({marked.size})
                </span>
                <div className={styles.markedTagsBox}>
                  {markedList.length === 0 ? (
                    <span className={styles.markedEmpty}>
                      Теги для удаления не выбраны
                    </span>
                  ) : (
                    markedList.map(({ key, name }) => (
                      <span key={key} className={styles.markedChip}>
                        <span className={styles.markedChipLabel}>
                          {String(name).toUpperCase()}
                        </span>
                        <button
                          type="button"
                          className={styles.markedChipRemove}
                          title="Отменить удаление тега"
                          aria-label={`Отменить удаление тега ${name}`}
                          onClick={() => unmarkKey(key)}
                        >
                          ×
                        </button>
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
        <div className={styles.footer}>
          {tab === 'xlsx' && (
            <button
              type="button"
              className={styles.resetBtn}
              onClick={resetXlsx}
              disabled={!xlsxFile || isBinding}
            >
              Сбросить
            </button>
          )}
          {tab === 'create' ? (
            <button
              type="button"
              className={styles.createBtn}
              onClick={handleCreate}
              disabled={tags.length === 0}
            >
              Создать
            </button>
          ) : tab === 'remove' ? (
            <button
              type="button"
              className={styles.removeBtn}
              onClick={handleRemove}
              disabled={marked.size === 0 || isDeleting}
            >
              {isDeleting ? 'Удаление…' : 'Удалить'}
            </button>
          ) : (
            <button
              type="button"
              className={styles.bindBtn}
              onClick={handleBindTags}
              disabled={!checkInfo || checkInfo.toLink.length === 0 || isBinding}
            >
              {isBinding ? 'Привязка…' : 'Привязать теги'}
            </button>
          )}
        </div>
      </div>
      </div>
      {toast && (
        <div
          className={`${styles.toast} ${
            toast.kind === 'error' ? styles.toastError : styles.toastSuccess
          } ${toast.kind === 'error' ? styles.toastRight : styles.toastLeft} ${
            toastVisible ? styles.toastVisible : ''
          }`}
        >
          {toast.text}
        </div>
      )}
    </>,
    document.body
  );
};

export default TagsManagerModal;
