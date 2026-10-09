import { useEffect, useMemo, useState } from 'react';
import { MdCheck, MdOutlineImageNotSupported } from 'react-icons/md';
import { animated, useSpring } from 'react-spring';
import { prepareAbTestRequest } from '../../../entities/ab-tests';
import styles from './AbTestCreateModal.module.css';

/** Настройки ползунков: CPM и показы. */
const CPM = { min: 10, max: 2000, step: 10, initial: 300 };
const VIEWS = { min: 50, max: 10000, step: 50, initial: 1500 };

/** Типы счёта: ключ в ответе balance — его подпись в интерфейсе. */
const BALANCE_TYPES = [
  { key: 0, label: 'Счёт' },
  { key: 1, label: 'Баланс' },
  { key: 3, label: 'Бонусы' },
];

/**
 * Бюджет теста: выбранные фото × показы × CPM / 1000
 * (CPM — цена за тысячу показов), округляем вверх до тысяч.
 *
 * @param {number} photosCount сколько фото участвует в тесте
 * @param {number} views показов на одно фото
 * @param {number} cpm ставка за 1000 показов
 * @returns {number}
 */
const countBudget = (photosCount, views, cpm) => {
  const value = (photosCount * views * cpm) / 1000;
  return value > 0 ? Math.ceil(value / 1000) * 1000 : 0;
};

/**
 * Число с разделителями разрядов.
 * @param {number} value
 * @returns {string}
 */
const formatMoney = (value) => Math.round(value || 0).toLocaleString('ru-RU');

/**
 * Этап настройки теста: выбор фотографий, CPM, количество показов,
 * расчёт бюджета и выбор кошелька.
 *
 * Три состояния нижней панели:
 *   — `idle`    «Создать тест» (активен, когда выбрано больше одного фото
 *               и кошелёк) + «Выбрать другой артикул»;
 *   — `creating` на месте кнопок крутится лоадер, поля настройки заблокированы;
 *   — `done`    «Создать новый тест» + «Закрыть».
 *
 * @param {object} props
 * @param {{
 *   skuInfo: { sku: number|string, vendorcode: string, photos: Array<string>, positions: Array<number> },
 *   balance: { 0: number, 1: number, 3: number },
 *   cashback: { amount: number, percent: number },
 * }} props.prepInfo подготовительная информация по артикулу
 * @param {() => void} props.onBack вернуться к поиску артикула
 * @param {() => void} props.onClose закрыть окно после успешного создания
 */
const AbTestSetup = ({ prepInfo, onBack, onClose }) => {
  // Позиции фоток идут не подряд и приходят от эндпоинта — храним их как есть.
  const photoList = useMemo(
    () =>
      (prepInfo.skuInfo.photos || []).map((url, index) => ({
        position: Number(prepInfo.skuInfo.positions?.[index] ?? index + 1),
        url,
      })),
    [prepInfo]
  );
  const lockedPosition = photoList[0]?.position ?? 1;

  const [selected, setSelected] = useState([lockedPosition]);
  const [cpm, setCpm] = useState(CPM.initial);
  const [views, setViews] = useState(VIEWS.initial);
  const [balanceType, setBalanceType] = useState(null);
  // Жизненный цикл отправки: idle → creating → done (или снова idle при ошибке).
  const [phase, setPhase] = useState('idle');
  const [toast, setToast] = useState(null);
  const [toastVisible, setToastVisible] = useState(false);

  const photos = prepInfo.skuInfo.photos || [];
  const isBusy = phase !== 'idle';
  const isDone = phase === 'done';

  // Фото с позицией 1 участвует в тесте всегда, его нельзя снять.
  useEffect(() => {
    setSelected((current) =>
      current.includes(lockedPosition)
        ? current
        : [lockedPosition, ...current]
    );
  }, [lockedPosition]);

  // Тост: выплывает, затем уползает сам.
  useEffect(() => {
    if (!toast) return undefined;
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

  const togglePhoto = (position) => {
    if (isBusy || position === lockedPosition) return;
    setSelected((current) =>
      current.includes(position)
        ? current.filter((item) => item !== position)
        : [...current, position]
    );
  };

  const budget = useMemo(
    () => countBudget(selected.length, views, cpm),
    [selected.length, views, cpm]
  );

  // Кнопка доступна, когда выбрано больше одного фото и выбран кошелёк.
  const canCreate = selected.length > 1 && balanceType != null;

  /**
   * Создание теста: POST /ab_tests/prepare_ab_test.
   * На время запроса поля настройки блокируются, панель показывает лоадер.
   * Успех переключает панель на «Создать новый тест / Закрыть»; ошибка
   * возвращает «Создать тест» и не сбрасывает выбранные настройки.
   */
  const handleCreate = () => {
    if (!canCreate || isBusy) return;

    const photosPayload = {};
    photoList.forEach(({ position, url }) => {
      if (url && selected.includes(position)) photosPayload[position] = url;
    });

    setPhase('creating');
    prepareAbTestRequest({
      sku: prepInfo.skuInfo.sku,
      cpm,
      views_goal: views,
      balance_type: balanceType,
      photos: photosPayload,
      budget: budget + 1000,
    })
      .then(() => {
        setPhase('done');
        setToast({ kind: 'success', text: 'Тест успешно создан' });
      })
      .catch(() => {
        setPhase('idle');
        setToast({ kind: 'error', text: 'Ошибка создания теста' });
      });
  };

  // Плавный пересчёт бюджета при смене фоток, CPM и показов.
  // Важно: анимированное значение должно быть единственным ребёнком элемента —
  // массив вида [значение, " ₽"] react-spring не резолвит и отдаёт в DOM
  // объект интерполяции (React падает с "Objects are not valid as a React child").
  const budgetSpring = useSpring({
    value: budget,
    config: { duration: 420 },
  });
  const budgetText = budgetSpring.value.to(
    (value) => `${formatMoney(value)} ₽`
  );

  // Кошелёк с деньгами меньше бюджета выбирать нельзя.
  useEffect(() => {
    setBalanceType((current) => {
      if (current == null) return current;
      const money = prepInfo.balance?.[current] ?? 0;
      return budget > money ? null : current;
    });
  }, [budget, prepInfo]);

  return (
    <div className={styles.setup}>
      <div className={styles.setupHead}>
        <span className={styles.setupSku}>{prepInfo.skuInfo.vendorcode}</span>
        <span className={styles.setupSkuId}>{prepInfo.skuInfo.sku}</span>
      </div>

      {/* Выбор фотографий: позиция 1 закреплена и всегда выбрана */}
      <div className={styles.setupSection}>
        <div className={styles.setupLabel}>
          Фотографии
          <span className={styles.setupHint}>
            выбрано {selected.length} из {photos.length}
          </span>
        </div>
        <div className={styles.photoScroll}>
          {photoList.map(({ position, url }) => {
            const isSelected = selected.includes(position);
            const isLocked = position === lockedPosition;
            return (
              <button
                type="button"
                key={`${position}-${url}`}
                className={`${styles.setupPhoto} ${
                  isSelected ? styles.setupPhotoOn : ''
                }`}
                disabled={isBusy}
                onClick={() => togglePhoto(position)}
                title={
                  isLocked
                    ? 'Первое фото обязательно'
                    : isSelected
                    ? 'Убрать фото'
                    : 'Добавить фото'
                }
              >
                {url ? (
                  <img
                    className={styles.setupPhotoImg}
                    src={url}
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
                <span className={styles.setupPhotoNum}>{position}</span>
                {isSelected && (
                  <span className={styles.setupPhotoCheck}>
                    <MdCheck />
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* CPM */}
      <div className={styles.setupSection}>
        <div className={styles.setupLabel}>CPM</div>
        <div className={styles.sliderRow}>
          <input
            type="range"
            className={styles.slider}
            min={CPM.min}
            max={CPM.max}
            step={CPM.step}
            value={cpm}
            disabled={isBusy}
            onChange={(e) => setCpm(Number(e.target.value))}
          />
          <input
            type="number"
            className={styles.numberInput}
            min={CPM.min}
            max={CPM.max}
            step={CPM.step}
            value={cpm}
            disabled={isBusy}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (Number.isFinite(next))
                setCpm(Math.min(Math.max(next, CPM.min), CPM.max));
            }}
          />
        </div>
      </div>

      {/* Показы на одно фото */}
      <div className={styles.setupSection}>
        <div className={styles.setupLabel}>Показы</div>
        <div className={styles.sliderRow}>
          <input
            type="range"
            className={styles.slider}
            min={VIEWS.min}
            max={VIEWS.max}
            step={VIEWS.step}
            value={views}
            disabled={isBusy}
            onChange={(e) => setViews(Number(e.target.value))}
          />
          <input
            type="number"
            className={styles.numberInput}
            min={VIEWS.min}
            max={VIEWS.max}
            step={VIEWS.step}
            value={views}
            disabled={isBusy}
            onChange={(e) => {
              const next = Number(e.target.value);
              if (Number.isFinite(next))
                setViews(Math.min(Math.max(next, VIEWS.min), VIEWS.max));
            }}
          />
        </div>
      </div>

      {/* Бюджет — только чтение */}
      <div className={styles.setupSection}>
        <div className={styles.setupLabel}>Бюджет</div>
        <animated.div className={styles.budget}>{budgetText}</animated.div>
      </div>

      {/* Выбор кошелька */}
      <div className={styles.setupSection}>
        <div className={styles.setupLabel}>Баланс</div>
        <div className={styles.balanceRow}>
          {BALANCE_TYPES.map(({ key, label }) => {
            const money = prepInfo.balance?.[key] ?? 0;
            const notEnough = budget > money;
            const isActive = balanceType === key;
            return (
              <button
                type="button"
                key={key}
                disabled={notEnough || isBusy}
                className={`${styles.balanceCard} ${
                  isActive ? styles.balanceCardOn : ''
                }`}
                title={notEnough ? 'Недостаточно средств' : label}
                onClick={() => setBalanceType(key)}
              >
                <span className={styles.balanceTitle}>{label}</span>
                <span className={styles.balanceValue}>
                  {formatMoney(money)} ₽
                </span>
                {notEnough && (
                  <span className={styles.balanceWarn}>Недостаточно средств</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Кэшбэк — справочно */}
      <div className={styles.setupSection}>
        <div className={styles.setupLabel}>Кэшбэк</div>
        <div className={styles.cashback}>
          <span>{formatMoney(prepInfo.cashback?.amount)} ₽</span>
          <span className={styles.cashbackPercent}>
            {prepInfo.cashback?.percent ?? 0}%
          </span>
        </div>
      </div>

      {/* Нижняя панель действий */}
      <div className={styles.setupFooter}>
        {phase === 'creating' && (
          <span className={styles.footerLoader} aria-label="Создание теста" />
        )}

        {phase === 'idle' && (
          <>
            <button
              type="button"
              className={styles.createBtn}
              disabled={!canCreate}
              onClick={handleCreate}
            >
              Создать тест
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={onBack}
            >
              Выбрать другой артикул
            </button>
          </>
        )}

        {isDone && (
          <>
            <button
              type="button"
              className={styles.createBtn}
              onClick={onBack}
            >
              Создать новый тест
            </button>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={onClose}
            >
              Закрыть
            </button>
          </>
        )}
      </div>

      {/* Тост об итоге создания */}
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
    </div>
  );
};

export default AbTestSetup;