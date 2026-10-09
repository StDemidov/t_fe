import { useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import { MdOutlineSearch, MdOutlineImageNotSupported } from 'react-icons/md';
import {
  fetchSkusTestAvailability,
  fetchAbTestLaunchPrepInfo,
} from '../../../entities/ab-tests';
import CardArticle from './CardArticle';
import AbTestSetup from './AbTestSetup';
import styles from './AbTestCreateModal.module.css';

/**
 * Окно создания A/B теста.
 *
 * Первый этап — поиск артикула в списке доступных:
 *   — только цифры        → поиск по полю `sku`;
 *   — цифры и буквы       → поиск по полю `vendorcode`.
 * Результаты показываются по нажатию Enter.
 *
 * Второй этап — после сбора данных по артикулу в том же окне
 * появляется настройка теста: выбор фото, CPM, показы, бюджет и баланс.
 *
 * @param {object} props
 * @param {boolean} props.open окно открыто
 * @param {() => void} props.onClose закрытие окна
 * @param {() => void} props.onTestCreated тест создан — перезапрос «В обработке»
 */
const AbTestCreateModal = ({ open, onClose, onTestCreated }) => {
  const [available, setAvailable] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [query, setQuery] = useState('');
  const [appliedQuery, setAppliedQuery] = useState('');
  // Данные по артикулу для настройки теста.
  const [prepInfo, setPrepInfo] = useState(null);
  const [isPrepLoading, setPrepLoading] = useState(false);
  const [prepError, setPrepError] = useState(null);
  const inputRef = useRef(null);

  // Запрос списка артикулов при каждом открытии окна.
  useEffect(() => {
    if (!open) return;

    let isMounted = true;
    setIsLoading(true);
    setLoadError(null);
    setQuery('');
    setAppliedQuery('');
    setPrepInfo(null);
    setPrepError(null);

    fetchSkusTestAvailability()
      .then((items) => {
        if (isMounted) setAvailable(items);
      })
      .catch((error) => {
        if (isMounted) {
          setLoadError(error.message || 'Не удалось загрузить список артикулов');
        }
      })
      .finally(() => {
        if (isMounted) setIsLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [open]);

  // Фокус в поле поиска — после загрузки артикулов, когда поле разблокировано.
  // На этапе настройки теста поля поиска уже нет — не фокусируем его.
  useEffect(() => {
    if (open && !prepInfo && !isLoading && !loadError)
      inputRef.current?.focus();
  }, [open, prepInfo, isLoading, loadError]);

  // Закрытие по Escape.
  useEffect(() => {
    if (!open) return undefined;
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  const results = useMemo(() => {
    const value = appliedQuery.trim();
    if (!value) return [];
    // Только цифры — ищем по SKU, иначе по артикулу.
    const isSkuSearch = /^\d+$/.test(value);
    const needle = value.toLowerCase();

    return available.filter((item) => {
      const haystack = isSkuSearch ? String(item.sku ?? '') : String(item.vendorcode ?? '');
      return haystack.toLowerCase().includes(needle);
    });
  }, [available, appliedQuery]);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      setAppliedQuery(query);
    }
  };

  /**
   * Сбор данных перед запуском: карточка товара и состояние кошелька.
   * Пока запрос летит — лоадер, после успеха в том же окне появляется
   * настройка теста (плюс подтверждение «Успешно» в нижней плашке).
   */
  const handleCreate = (sku) => {
    setPrepInfo(null);
    setPrepError(null);
    setPrepLoading(true);

    fetchAbTestLaunchPrepInfo(sku)
      .then(setPrepInfo)
      .catch((error) => {
        setPrepError(
          error?.response?.data?.detail ||
            error.message ||
            'Не удалось собрать информацию об артикуле'
        );
      })
      .finally(() => setPrepLoading(false));
  };

  /**
   * Сброс на первый этап: возвращаемся к строке поиска артикула.
   * Используется кнопками «Выбрать другой артикул» и «Создать новый тест».
   */
  const resetToSearch = () => {
    setPrepInfo(null);
    setPrepError(null);
    setQuery('');
    setAppliedQuery('');
  };

  /**
   * Закрытие после успешного создания: перезапрос «В обработке», чтобы
   * новый тест сразу попал в список, и закрытие окна.
   */
  const closeAfterCreated = () => {
    onTestCreated?.();
    onClose();
  };

  if (!open) return null;

  return createPortal(
    <div className={styles.overlay} onMouseDown={onClose}>
      <div className={styles.modal} onMouseDown={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <span className={styles.title}>Создание теста</span>
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

        {!prepInfo && (
          <div className={styles.searchRow}>
            <MdOutlineSearch className={styles.searchIcon} />
            <input
              ref={inputRef}
              type="text"
              className={styles.searchInput}
              placeholder="Введите SKU или артикул"
              value={query}
              disabled={isLoading}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
            />
            <button
              type="button"
              className={styles.findBtn}
              disabled={isLoading}
              onClick={() => setAppliedQuery(query)}
            >
              Найти
            </button>
          </div>
        )}

        <div className={styles.content}>
          {/* Настройка теста — вместо списка артикулов */}
          {prepInfo ? (
            <AbTestSetup
              prepInfo={prepInfo}
              onBack={resetToSearch}
              onClose={closeAfterCreated}
            />
          ) : (
            <>
              {isLoading && (
                <div className={styles.state}>
                  <span className={styles.spinner} aria-label="Загрузка" />
                </div>
              )}
              {!isLoading && loadError && (
                <div className={styles.stateError}>{loadError}</div>
              )}

              {!isLoading && !loadError && appliedQuery.trim() === '' && (
                <div className={styles.state}>
                  Введите SKU или артикул и нажмите Enter
                </div>
              )}

              {!isLoading && !loadError && appliedQuery.trim() !== '' && (
                results.length === 0 ? (
                  <div className={styles.state}>Ничего не найдено</div>
                ) : (
                  <div className={styles.cards}>
                    {results.map((item) => (
                      <div className={styles.card} key={item.sku}>
                        <div className={styles.photoWrap}>
                          {item.photo ? (
                            <img
                              className={styles.photo}
                              src={item.photo}
                              alt=""
                              loading="lazy"
                              decoding="async"
                              onError={(e) => {
                                e.currentTarget.style.visibility = 'hidden';
                              }}
                            />
                          ) : (
                            <MdOutlineImageNotSupported className={styles.photoIcon} />
                          )}
                        </div>
                        <div className={styles.cardInfo}>
                          <CardArticle vendorCode={item.vendorcode} />
                          <span className={styles.sku}>{item.sku}</span>
                        </div>
                        {item.hasActiveTest ? (
                          <button
                            type="button"
                            className={styles.cardBtnDisabled}
                            disabled
                          >
                            Есть A/B тест
                          </button>
                        ) : (
                          <button
                            type="button"
                            className={styles.cardBtn}
                            disabled={isPrepLoading}
                            onClick={() => handleCreate(item.sku)}
                          >
                            Создать тест
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                )
              )}
            </>
          )}
        </div>

        {/* Статус сбора данных закреплён поверх содержимого внизу окна,
            чтобы его было видно даже после прокрутки списка артикулов.
            Плашка успеха больше не показывается: на этапе настройки её место
            занимают кнопки действий. */}
        {(isPrepLoading || prepError) && (
          <div className={styles.prepBar}>
            {isPrepLoading && (
              <>
                <span className={styles.spinner} aria-hidden="true" />
                <span>Сбор информации об артикуле</span>
              </>
            )}
            {prepError && !isPrepLoading && (
              <span className={styles.prepError}>{prepError}</span>
            )}
          </div>
        )}
      </div>
    </div>,
    document.body
  );
};

export default AbTestCreateModal;