import { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { CiSettings } from 'react-icons/ci';
import { FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

import { updatePromo } from '../../../entities/promo';
import { setError } from '../../../redux/slices/errorSlice';
import { setNotification } from '../../../redux/slices/notificationSlice';
import styles from './PromoBulkSettingsModal.module.css';

const hours = Array.from({ length: 24 }, (_, index) => String(index));

const integerInput = (value) => String(value).replace(/\D/g, '');
const decimalInput = (value) =>
  String(value).replace(',', '.').replace(/[^\d.]/g, '');
const turnoverInput = (value) => {
  const normalized = String(value).replace(/[^\d-]/g, '');
  return normalized.startsWith('-')
    ? `-${normalized.slice(1).replace(/-/g, '')}`
    : normalized;
};

const SettingButton = ({ enabled, onClick, label }) => (
  <button
    type="button"
    className={`${styles.settingButton} ${enabled ? styles.settingButtonActive : ''}`}
    title={enabled ? `Не изменять: ${label}` : `Изменить: ${label}`}
    aria-label={enabled ? `Не изменять: ${label}` : `Изменить: ${label}`}
    onClick={onClick}
  >
    <CiSettings />
  </button>
);

const PromoBulkSettingsModal = ({ ids, onClose, onSaved }) => {
  const dispatch = useDispatch();
  const [enabled, setEnabled] = useState({});
  const [form, setForm] = useState({
    budgetFloor: '',
    replenishmentAmount: '',
    viewsBench: '',
    ctrBench: '',
    lowerTurnoverThreshold: '',
    turnoverDays: '',
    turnoverByBarcodes: null,
    hasActiveHours: null,
    startHour: '0',
    pauseHour: '0',
    daysToFixingMetrics: '',
  });
  const [isSaving, setIsSaving] = useState(false);
  const [error, setErrorMessage] = useState('');

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSaving) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSaving, onClose]);

  const toggle = (field) => {
    setEnabled((current) => ({ ...current, [field]: !current[field] }));
    setErrorMessage('');
  };

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setErrorMessage('');
  };

  const getPayload = () => {
    const payload = { ids_list: ids };
    const positiveFields = [
      ['budgetFloor', 'budget_floor', 'Порог пополнения'],
      ['replenishmentAmount', 'replinishment_amount', 'Сумма пополнения'],
      ['viewsBench', 'views_bench', 'Порог показов'],
      ['daysToFixingMetrics', 'days_to_fixing_metrics', 'Дней до фиксации метрик'],
      ['turnoverDays', 'turnover_days', 'Дней для расчёта оборачиваемости'],
    ];

    for (const [field, key, label] of positiveFields) {
      if (!enabled[field]) continue;
      const value = Number(form[field]);
      if (!Number.isFinite(value) || value <= 0) {
        return { error: `${label} должно быть больше нуля` };
      }
      payload[key] = value;
    }

    if (enabled.ctrBench) {
      const value = Number(form.ctrBench);
      if (!Number.isFinite(value) || value <= 0) {
        return { error: 'Порог CTR должен быть больше нуля' };
      }
      payload.ctr_bench = value / 100;
    }

    if (enabled.lowerTurnoverThreshold) {
      const value = Number(form.lowerTurnoverThreshold);
      if (!Number.isFinite(value) || (value <= 0 && value !== -1)) {
        return { error: 'Порог оборачиваемости должен быть больше нуля или равен -1' };
      }
      payload.lower_turnover_threshold = value;
    }

    if (enabled.turnoverByBarcodes) {
      if (form.turnoverByBarcodes === null) {
        return { error: 'Выберите способ расчёта оборачиваемости' };
      }
      payload.turnover_by_barcodes = form.turnoverByBarcodes;
    }

    if (enabled.hasActiveHours) {
      if (form.hasActiveHours === null) {
        return { error: 'Выберите режим часов активности' };
      }
      payload.has_active_hours = form.hasActiveHours;
      if (form.hasActiveHours) {
        payload.start_hour = Number(form.startHour);
        payload.pause_hour = Number(form.pauseHour);
        if (payload.start_hour === payload.pause_hour) {
          return { error: 'Часы активности должны отличаться' };
        }
      }
    }

    return { payload };
  };

  const handleSubmit = async () => {
    const { payload, error: validationError } = getPayload();
    if (validationError) {
      setErrorMessage(validationError);
      return;
    }
    if (Object.keys(payload).length === 1) {
      setErrorMessage('Включите хотя бы один параметр для изменения');
      return;
    }

    setIsSaving(true);
    setErrorMessage('');
    try {
      await updatePromo(payload);
      dispatch(setNotification('Настройки выбранных РК сохранены'));
      onSaved?.();
      onClose();
    } catch (requestError) {
      const message =
        requestError?.response?.data?.detail ||
        requestError?.message ||
        'Не удалось сохранить настройки РК';
      setErrorMessage(message);
      dispatch(setError(message));
    } finally {
      setIsSaving(false);
    }
  };

  const field = (name, label, value, onChange, inputMode = 'numeric') => (
    <label className={styles.field}>
      <span>{label}</span>
      <div className={styles.inputLine}>
        <input
          inputMode={inputMode}
          disabled={!enabled[name]}
          value={value}
          onChange={onChange}
        />
        <SettingButton
          enabled={Boolean(enabled[name])}
          onClick={() => toggle(name)}
          label={label}
        />
      </div>
    </label>
  );

  return createPortal(
    <div className={styles.overlay} onClick={() => !isSaving && onClose()}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Массовые настройки РК"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <h2>Массовые настройки РК</h2>
            <p>Выбрано кампаний: {ids.length}. Значения по умолчанию не задаются.</p>
          </div>
          <button
            type="button"
            className={styles.closeButton}
            aria-label="Закрыть окно"
            onClick={onClose}
            disabled={isSaving}
          >
            <FaTimes />
          </button>
        </header>

        <div className={styles.content}>
          <section className={styles.section}>
            <h3>Бюджет</h3>
            {field('budgetFloor', 'Порог пополнения', form.budgetFloor, (event) =>
              setField('budgetFloor', integerInput(event.target.value))
            )}
            {field(
              'replenishmentAmount',
              'Сумма пополнения',
              form.replenishmentAmount,
              (event) =>
                setField('replenishmentAmount', integerInput(event.target.value))
            )}
          </section>

          <section className={styles.section}>
            <h3>Пороги для кластеров</h3>
            {field('viewsBench', 'Показы', form.viewsBench, (event) =>
              setField('viewsBench', integerInput(event.target.value))
            )}
            {field('ctrBench', 'CTR, %', form.ctrBench, (event) =>
              setField('ctrBench', decimalInput(event.target.value)), 'decimal'
            )}
          </section>

          <section className={styles.section}>
            <h3>Оборачиваемость</h3>
            {field(
              'lowerTurnoverThreshold',
              'Порог оборачиваемости, -1 — снять паузу',
              form.lowerTurnoverThreshold,
              (event) =>
                setField(
                  'lowerTurnoverThreshold',
                  event.target.value === '-1'
                    ? '-1'
                    : turnoverInput(event.target.value)
                )
            )}
            {field('turnoverDays', 'Дней для расчёта', form.turnoverDays, (event) =>
              setField('turnoverDays', integerInput(event.target.value))
            )}
            <div className={styles.choiceLine}>
              <span>По артикулам / по размерам</span>
              <div className={styles.choiceButtons}>
                {[false, true].map((value) => (
                  <button
                    type="button"
                    key={String(value)}
                    disabled={!enabled.turnoverByBarcodes}
                    className={form.turnoverByBarcodes === value ? styles.selected : ''}
                    onClick={() => setField('turnoverByBarcodes', value)}
                  >
                    {value ? 'По размерам' : 'По артикулу'}
                  </button>
                ))}
                <SettingButton
                  enabled={Boolean(enabled.turnoverByBarcodes)}
                  onClick={() => toggle('turnoverByBarcodes')}
                  label="способ расчёта оборачиваемости"
                />
              </div>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Часы активности</h3>
            <div className={styles.choiceLine}>
              <span>Режим активности</span>
              <div className={styles.choiceButtons}>
                {[
                  [false, 'Круглосуточно'],
                  [true, 'По времени'],
                ].map(([value, label]) => (
                  <button
                    type="button"
                    key={label}
                    disabled={!enabled.hasActiveHours}
                    className={form.hasActiveHours === value ? styles.selected : ''}
                    onClick={() => setField('hasActiveHours', value)}
                  >
                    {label}
                  </button>
                ))}
                <SettingButton
                  enabled={Boolean(enabled.hasActiveHours)}
                  onClick={() => toggle('hasActiveHours')}
                  label="часы активности"
                />
              </div>
            </div>
            <div className={styles.hourLine}>
              <label>
                <span>С</span>
                <select
                  disabled={!enabled.hasActiveHours || !form.hasActiveHours}
                  value={form.startHour}
                  onChange={(event) => setField('startHour', event.target.value)}
                >
                  {hours.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour.padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span>До</span>
                <select
                  disabled={!enabled.hasActiveHours || !form.hasActiveHours}
                  value={form.pauseHour}
                  onChange={(event) => setField('pauseHour', event.target.value)}
                >
                  {hours.map((hour) => (
                    <option key={hour} value={hour}>
                      {hour.padStart(2, '0')}:00
                    </option>
                  ))}
                </select>
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Фиксация метрик</h3>
            {field(
              'daysToFixingMetrics',
              'Дней до фиксации метрик',
              form.daysToFixingMetrics,
              (event) =>
                setField('daysToFixingMetrics', integerInput(event.target.value))
            )}
          </section>

          {error && <div className={styles.error}>{error}</div>}
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.cancel} onClick={onClose} disabled={isSaving}>
            Отмена
          </button>
          <button type="button" className={styles.submit} onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Сохранение...' : 'Принять изменения'}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
};

export default PromoBulkSettingsModal;
