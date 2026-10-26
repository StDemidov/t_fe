import { useEffect, useMemo, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import { useDispatch } from 'react-redux';

import { updatePromo } from '../../../entities/promo';
import { setError } from '../../../redux/slices/errorSlice';
import { setNotification } from '../../../redux/slices/notificationSlice';
import styles from './PromoSettingsModal.module.css';

const hours = Array.from({ length: 24 }, (_, index) => String(index));

const valueOf = (campaign, camelKey) => {
  const snakeKey = camelKey.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
  return campaign?.[camelKey] ?? campaign?.[snakeKey];
};

const numberValue = (value) => {
  const number = Number(value);
  return Number.isFinite(number) ? number : 0;
};

const integerInput = (value) => String(value).replace(/\D/g, '');

const decimalInput = (value) =>
  String(value).replace(',', '.').replace(/[^\d.]/g, '');

const formatCtr = (value) => {
  const number = numberValue(value);
  return number ? String(Number((number * 100).toFixed(4))) : '';
};

const PromoSettingsModal = ({ campaign, onClose, onSaved }) => {
  const dispatch = useDispatch();
  const isUnified = campaign?.bidType === 'unified';

  const initial = useMemo(() => {
    const lowerTurnoverThreshold = numberValue(
      valueOf(campaign, 'lowerTurnoverThreshold')
    );
    const hasActiveHours = Boolean(valueOf(campaign, 'hasActiveHours'));

    return {
      budgetFloor: String(valueOf(campaign, 'budgetFloor') ?? ''),
      replenishmentAmount: String(
        valueOf(campaign, 'replinishmentAmount') ?? ''
      ),
      viewsBench: String(valueOf(campaign, 'viewsBench') ?? ''),
      ctrBench: formatCtr(valueOf(campaign, 'ctrBench')),
      checkTurnover: lowerTurnoverThreshold > 0,
      turnoverThreshold:
        lowerTurnoverThreshold > 0 ? String(lowerTurnoverThreshold) : '',
      turnoverDays: String(valueOf(campaign, 'turnoverDays') ?? ''),
      turnoverByBarcodes: Boolean(valueOf(campaign, 'turnoverByBarcodes')),
      allDay: !hasActiveHours,
      startHour: String(valueOf(campaign, 'startHour') ?? '0'),
      pauseHour: String(valueOf(campaign, 'pauseHour') ?? '0'),
      daysToFixing: String(valueOf(campaign, 'daysToFixingMetrics') ?? ''),
    };
  }, [campaign]);

  const [form, setForm] = useState(initial);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setLocalError] = useState('');

  useEffect(() => {
    setForm(initial);
    setLocalError('');
  }, [initial]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !isSaving) onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isSaving, onClose]);

  const payload = useMemo(() => {
    const result = { ids_list: [campaign?.id] };
    const current = {
      budgetFloor: numberValue(valueOf(campaign, 'budgetFloor')),
      replenishmentAmount: numberValue(
        valueOf(campaign, 'replinishmentAmount')
      ),
      viewsBench: numberValue(valueOf(campaign, 'viewsBench')),
      ctrBench: numberValue(valueOf(campaign, 'ctrBench')) * 100,
      turnoverThreshold: numberValue(
        valueOf(campaign, 'lowerTurnoverThreshold')
      ),
      turnoverDays: numberValue(valueOf(campaign, 'turnoverDays')),
      turnoverByBarcodes: Boolean(valueOf(campaign, 'turnoverByBarcodes')),
      hasActiveHours: Boolean(valueOf(campaign, 'hasActiveHours')),
      startHour: numberValue(valueOf(campaign, 'startHour')),
      pauseHour: numberValue(valueOf(campaign, 'pauseHour')),
      daysToFixing: numberValue(valueOf(campaign, 'daysToFixingMetrics')),
    };

    if (numberValue(form.budgetFloor) !== current.budgetFloor) {
      result.budget_floor = numberValue(form.budgetFloor);
    }
    if (
      numberValue(form.replenishmentAmount) !== current.replenishmentAmount
    ) {
      result.replinishment_amount = numberValue(form.replenishmentAmount);
    }
    if (isUnified && numberValue(form.viewsBench) !== current.viewsBench) {
      result.views_bench = numberValue(form.viewsBench);
    }
    if (isUnified && numberValue(form.ctrBench) !== current.ctrBench) {
      result.ctr_bench = numberValue(form.ctrBench) / 100;
    }

    const initialTurnoverChanged = form.checkTurnover !== initial.checkTurnover;
    if (initialTurnoverChanged) {
      result.lower_turnover_threshold = form.checkTurnover
        ? numberValue(form.turnoverThreshold)
        : -1;
      if (form.checkTurnover) result.turnover_days = numberValue(form.turnoverDays);
    } else if (form.checkTurnover) {
      if (numberValue(form.turnoverThreshold) !== current.turnoverThreshold) {
        result.lower_turnover_threshold = numberValue(form.turnoverThreshold);
      }
      if (numberValue(form.turnoverDays) !== current.turnoverDays) {
        result.turnover_days = numberValue(form.turnoverDays);
      }
    }
    if (form.turnoverByBarcodes !== current.turnoverByBarcodes) {
      result.turnover_by_barcodes = form.turnoverByBarcodes;
    }

    if (isUnified && numberValue(form.daysToFixing) !== current.daysToFixing) {
      result.days_to_fixing_metrics = numberValue(form.daysToFixing);
    }

    if (form.allDay !== initial.allDay) {
      result.has_active_hours = !form.allDay;
      if (!form.allDay) {
        result.start_hour = numberValue(form.startHour);
        result.pause_hour = numberValue(form.pauseHour);
      }
    } else if (!form.allDay) {
      if (numberValue(form.startHour) !== current.startHour) {
        result.start_hour = numberValue(form.startHour);
      }
      if (numberValue(form.pauseHour) !== current.pauseHour) {
        result.pause_hour = numberValue(form.pauseHour);
      }
    }

    return result;
  }, [campaign, form, initial, isUnified]);

  const validationErrors = useMemo(() => {
    const errors = [];
    const changed = (key) => Object.prototype.hasOwnProperty.call(payload, key);

    if (changed('budget_floor') && numberValue(form.budgetFloor) <= 0) {
      errors.push('Порог пополнения должен быть больше нуля');
    }
    if (
      changed('replinishment_amount') &&
      numberValue(form.replenishmentAmount) <= 0
    ) {
      errors.push('Сумма пополнения должна быть больше нуля');
    }
    if (changed('views_bench') && numberValue(form.viewsBench) <= 0) {
      errors.push('Порог показов должен быть больше нуля');
    }
    if (changed('ctr_bench') && numberValue(form.ctrBench) <= 0) {
      errors.push('Порог CTR должен быть больше нуля');
    }
    if (form.checkTurnover && numberValue(form.turnoverThreshold) <= 0) {
      if (changed('lower_turnover_threshold')) {
        errors.push('Порог оборачиваемости должен быть больше нуля');
      }
    }
    if (form.checkTurnover && numberValue(form.turnoverDays) <= 0) {
      if (changed('turnover_days')) {
        errors.push('Дней для расчёта оборачиваемости должно быть больше нуля');
      }
    }
    if (changed('days_to_fixing_metrics') && numberValue(form.daysToFixing) <= 0) {
      errors.push('Дней до фиксации метрик должно быть больше нуля');
    }
    if (
      !form.allDay &&
      (numberValue(form.startHour) === numberValue(form.pauseHour)) &&
      (changed('has_active_hours') || changed('start_hour') || changed('pause_hour'))
    ) {
      errors.push('Часы активности должны отличаться');
    }
    return errors;
  }, [form, payload]);

  const setField = (field, value) => {
    setForm((current) => ({ ...current, [field]: value }));
    setLocalError('');
  };

  const handleSubmit = async () => {
    if (Object.keys(payload).length === 1 || validationErrors.length > 0) return;

    setIsSaving(true);
    setLocalError('');
    try {
      await updatePromo(payload);
      dispatch(setNotification('Настройки РК сохранены'));
      onSaved?.();
      onClose();
    } catch (requestError) {
      const message =
        requestError?.response?.data?.detail ||
        requestError?.message ||
        'Не удалось сохранить настройки РК';
      setLocalError(message);
      dispatch(setError(message));
    } finally {
      setIsSaving(false);
    }
  };

  if (!campaign) return null;

  const hasChanges = Object.keys(payload).length > 1;

  return createPortal(
    <div className={styles.overlay} onClick={() => !isSaving && onClose()}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Настройки РК"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <h2>Настройки РК</h2>
            <p>{campaign.vendorcode || campaign.sku || `РК ${campaign.id}`}</p>
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
            <div className={styles.fieldGrid}>
              <label>
                <span>Порог пополнения</span>
                <input
                  inputMode="numeric"
                  value={form.budgetFloor}
                  onChange={(event) =>
                    setField('budgetFloor', integerInput(event.target.value))
                  }
                />
              </label>
              <label>
                <span>Сумма пополнения</span>
                <input
                  inputMode="numeric"
                  value={form.replenishmentAmount}
                  onChange={(event) =>
                    setField(
                      'replenishmentAmount',
                      integerInput(event.target.value)
                    )
                  }
                />
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Пороги для кластеров</h3>
            <div className={styles.fieldGrid}>
              <label>
                <span>Показы</span>
                <input
                  inputMode="numeric"
                  disabled={!isUnified}
                  value={form.viewsBench}
                  onChange={(event) =>
                    setField('viewsBench', integerInput(event.target.value))
                  }
                />
              </label>
              <label>
                <span>CTR, %</span>
                <input
                  inputMode="decimal"
                  disabled={!isUnified}
                  value={form.ctrBench}
                  onChange={(event) =>
                    setField('ctrBench', decimalInput(event.target.value))
                  }
                />
              </label>
            </div>
          </section>

          <section className={styles.section}>
            <h3>Проверка оборачиваемости</h3>
            <button
              type="button"
              className={`${styles.toggle} ${form.checkTurnover ? styles.active : ''}`}
              onClick={() => setField('checkTurnover', !form.checkTurnover)}
            >
              Проверять оборачиваемость
            </button>
            {!form.checkTurnover && (
              <p className={styles.hint}>
                При отключении будет отправлено значение -1 и снята пауза по
                оборачиваемости.
              </p>
            )}
            <div className={styles.choices}>
              {[false, true].map((value) => (
                <button
                  type="button"
                  key={String(value)}
                  className={form.turnoverByBarcodes === value ? styles.selected : ''}
                  disabled={!form.checkTurnover}
                  onClick={() => setField('turnoverByBarcodes', value)}
                >
                  {value ? 'По размерам' : 'По артикулу'}
                </button>
              ))}
            </div>
            <div className={styles.fieldGrid}>
              <label>
                <span>Порог оборачиваемости</span>
                <input
                  inputMode="numeric"
                  disabled={!form.checkTurnover}
                  value={form.turnoverThreshold}
                  onChange={(event) =>
                    setField('turnoverThreshold', integerInput(event.target.value))
                  }
                />
              </label>
              <label>
                <span>Дней для расчёта</span>
                <input
                  inputMode="numeric"
                  disabled={!form.checkTurnover}
                  value={form.turnoverDays}
                  onChange={(event) =>
                    setField('turnoverDays', integerInput(event.target.value))
                  }
                />
              </label>
            </div>
          </section>

          {isUnified && (
            <section className={styles.section}>
              <h3>Фиксация метрик</h3>
              <label className={styles.singleField}>
                <span>Дней до фиксации</span>
                <input
                  inputMode="numeric"
                  value={form.daysToFixing}
                  onChange={(event) =>
                    setField('daysToFixing', integerInput(event.target.value))
                  }
                />
              </label>
            </section>
          )}

          <section className={styles.section}>
            <h3>Часы активности</h3>
            <div className={styles.choices}>
              {[
                [true, 'Круглосуточно'],
                [false, 'По времени'],
              ].map(([value, label]) => (
                <button
                  type="button"
                  key={label}
                  className={form.allDay === value ? styles.selected : ''}
                  onClick={() => setField('allDay', value)}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className={styles.hourGrid}>
              <label>
                <span>С</span>
                <select
                  disabled={form.allDay}
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
                  disabled={form.allDay}
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

          {validationErrors.length > 0 && (
            <div className={styles.validation}>{validationErrors[0]}</div>
          )}
          {error && <div className={styles.error}>{error}</div>}
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.cancel} onClick={onClose} disabled={isSaving}>
            Отмена
          </button>
          <button
            type="button"
            className={styles.submit}
            disabled={!hasChanges || validationErrors.length > 0 || isSaving}
            onClick={handleSubmit}
          >
            {isSaving ? 'Сохранение...' : 'Принять изменения'}
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
};

export default PromoSettingsModal;
