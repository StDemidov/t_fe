import { useEffect, useState } from 'react';
import { FcCancel } from 'react-icons/fc';
import { FaRegEdit } from 'react-icons/fa';
import { IoCheckmarkCircleSharp } from 'react-icons/io5';
import { PiWarningCircleFill } from 'react-icons/pi';

import styles from './style.module.css';
import ConfirmModal from '../../confirm_modal/ConfirmModal';
import { useDispatch } from 'react-redux';
import { editCampaigns } from '../../../redux/slices/campaignsSlice';
import { hostName } from '../../../utils/host';
import {
  hideTooltip,
  showTooltip,
} from '../../../TooltipManager/TooltipManager';

const EditCampaignsModal = ({ selectedCamps, onClose }) => {
  const [budgetFloor, setBudgetFloor] = useState(1000);
  const [budgetFloorChange, setBudgetFloorChange] = useState(false);
  const [replinishmentAmount, setReplinishmentAmount] = useState(1000);
  const [replinishmentAmountChange, setReplinishmentAmountChange] =
    useState(false);

  const [ctrBench, setCtrBench] = useState(0.01);
  const [ctrBenchChange, setCtrBenchChange] = useState(false);
  const [percentInput, setPercentInput] = useState((ctrBench * 100).toString());
  const [viewsBench, setViewsBench] = useState(100);
  const [viewsBenchChange, setViewsBenchChange] = useState(false);

  const [lowerTurnoverThreshold, setLowerTurnoverThreshold] = useState(10);
  const [lowerTurnoverThresholdChange, setLowerTurnoverThresholdChange] =
    useState(false);
  const [turnoverDays, setTurnoverDays] = useState(4);
  const [turnoverDaysChange, setTurnoverDaysChange] = useState(false);
  const [turnoverByBarcode, setTurnoverByBarcodes] = useState(true);
  const [turnoverByBarcodeChange, setTurnoverByBarcodesChange] =
    useState(false);

  const [hasActiveHours, setHasActiveHours] = useState(false);
  const [hasActiveHoursChange, setHasActiveHoursChange] = useState(false);
  const [startHour, setStartHour] = useState(0);
  const [pauseHour, setPauseHour] = useState(0);

  const [isCreateEnabled, setIsCreateEnabled] = useState(false);

  const dispatch = useDispatch();

  const [modalData, setModalData] = useState({
    isOpen: false,
    text: '',
    onConfirm: null,
  });
  const handleMouseEnter = (e) => {
    const text = e.currentTarget.getAttribute('data-value');
    showTooltip(text);
  };
  const handleMouseLeave = () => {
    setTimeout(() => hideTooltip(), 150); // задержка для сглаживания
  };

  const openConfirmModal = (text, onConfirm) => {
    setModalData({
      isOpen: true,
      text,
      onConfirm: () => {
        onConfirm();
        setModalData({ ...modalData, isOpen: false });
      },
    });
  };

  useEffect(() => {
    setIsCreateEnabled(checkAllConditions());
  }, [
    ctrBench,
    viewsBench,
    lowerTurnoverThreshold,
    hasActiveHours,
    startHour,
    pauseHour,
    turnoverDays,
    budgetFloor,
    replinishmentAmount,
  ]);

  const closeModal = () => {
    setModalData({ ...modalData, isOpen: false });
  };

  const checkAllConditions = () => {
    // 1) ctrBench больше нуля
    const condition1 = ctrBench > 0;

    // 2) viewsBench больше нуля
    const condition2 = viewsBench > 0;

    // 5) lowerTurnoverThreshold - должен быть больше или равен 0
    const condition5 = lowerTurnoverThreshold >= 0;

    // 6) Если hasActiveHours == True, то startHour не должен быть равен pauseHour
    const condition6 =
      !hasActiveHours || (hasActiveHours && startHour !== pauseHour);

    // 7) TurnoverDays должен быть больше 0
    const condition7 = turnoverDays > 0;

    // 9) budgetFloor должен быть больше или равен 1000 и кратен 100
    const condition9 = budgetFloor >= 1000 && budgetFloor % 100 === 0;

    // 10) replinishmentAmount должен быть больше или равен 1000 и кратен 100
    const condition10 =
      replinishmentAmount >= 1000 && replinishmentAmount % 100 === 0;

    // Проверяем все условия
    return (
      condition1 &&
      condition2 &&
      condition5 &&
      condition6 &&
      condition7 &&
      condition9 &&
      condition10
    );
  };

  const validatePositiveInteger = (value) => {
    const cleanedValue = value.replace(/[^\d]/g, '');
    if (cleanedValue === '') return 0;
    const numValue = parseInt(cleanedValue, 10);
    return isNaN(numValue) ? 0 : numValue;
  };

  const handlePercentInputChange = (e) => {
    const value = e.target.value;
    // Разрешаем только цифры, точку и запятую
    const isValid = /^[\d.,]*$/.test(value);
    if (!isValid) {
      return; // Не обновляем при невалидном вводе
    }
    // Проверяем количество точек/запятых
    const dotCount = (value.match(/\./g) || []).length;
    const commaCount = (value.match(/,/g) || []).length;
    if (dotCount > 1 || commaCount > 1 || (dotCount > 0 && commaCount > 0)) {
      return; // Больше одной разделительной точки/запятой
    }
    setPercentInput(value);
    // Если ввод завершен (не заканчивается на разделитель), обновляем значение
    if (value !== '' && !value.endsWith('.') && !value.endsWith(',')) {
      const normalized = value.replace(/,/g, '.');
      const numValue = parseFloat(normalized);

      if (!isNaN(numValue) && numValue >= 0) {
        const roundedValue = Math.round(numValue * 100) / 100;
        setCtrBench(roundedValue / 100);
      }
    }
  };

  const handlePercentBlur = () => {
    if (percentInput === '' || percentInput === '.' || percentInput === ',') {
      setCtrBench(0);
      setPercentInput('0');
      return;
    }
    const normalized = percentInput.replace(/,/g, '.');
    const numValue = parseFloat(normalized);

    if (!isNaN(numValue) && numValue >= 0) {
      const roundedValue = Math.round(numValue * 100) / 100;
      setCtrBench((roundedValue / 100).toFixed(4));
      setPercentInput(roundedValue.toFixed(2));
    } else {
      setCtrBench(0);
      setPercentInput('0');
    }
  };

  const handleNumberChange = (setter) => (e) => {
    const validatedValue = validatePositiveInteger(e.target.value);
    setter(validatedValue);
  };

  const buildChangedData = () => {
    const fields = [
      {
        changed: budgetFloorChange,
        key: 'budget_floor',
        value: budgetFloor,
      },
      {
        changed: replinishmentAmountChange,
        key: 'replinishment_amount',
        value: replinishmentAmount,
      },
      {
        changed: ctrBenchChange,
        key: 'ctr_bench',
        value: Number(ctrBench),
      },
      {
        changed: viewsBenchChange,
        key: 'views_bench',
        value: viewsBench,
      },
      {
        changed: lowerTurnoverThresholdChange,
        key: 'lower_turnover_threshold',
        value: lowerTurnoverThreshold,
      },
      {
        changed: turnoverDaysChange,
        key: 'turnover_days',
        value: turnoverDays,
      },
      {
        changed: turnoverByBarcodeChange,
        key: 'turnover_by_barcodes',
        value: turnoverByBarcode,
      },
      {
        changed: hasActiveHoursChange,
        key: 'has_active_hours',
        value: hasActiveHours,
      },
    ];

    const result = {};

    fields.forEach(({ changed, key, value }) => {
      if (changed) {
        result[key] = value;
      }
    });

    if (hasActiveHoursChange && hasActiveHours) {
      result.start_hour = startHour;
      result.pause_hour = pauseHour;
    }

    return result;
  };

  const anythingChanged =
    budgetFloorChange ||
    replinishmentAmountChange ||
    ctrBenchChange ||
    viewsBenchChange ||
    lowerTurnoverThresholdChange ||
    turnoverDaysChange ||
    hasActiveHoursChange ||
    turnoverByBarcodeChange;

  const handleClickOnEdit = (e) => {
    e.stopPropagation();
    e.preventDefault();
    console.log('tut');
    openConfirmModal(`Вы подтверждаете изменения?`, (e) => {
      const data = buildChangedData();
      dispatch(
        editCampaigns({
          data: {
            camp_list: selectedCamps.map(Number),
            data: data,
          },
          url: `${hostName}/ad_camps/edit`,
        })
      );
      console.log('Изменённые данные:', data);
      onClose();
    });
  };
  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <fieldset className={styles.settingsBox}>
          <legend className={styles.legend}>
            Изменение настроек для кампаний
          </legend>
          <div className={styles.selectedCampsNumber}>
            Количество выбранных кампаний: <b>{selectedCamps.length}</b>
          </div>

          <div>
            <span className={styles.mainLabel}>
              <b>Бюджет</b>
            </span>

            <div className={styles.settingsSection}>
              <div className={styles.settingsRow}>
                <div className={styles.labelRow}>
                  <label htmlFor="budgetFloor">Порог для пополнения</label>
                  {budgetFloorChange ? (
                    budgetFloor >= 1000 && budgetFloor % 100 === 0 ? (
                      <IoCheckmarkCircleSharp color="green" />
                    ) : (
                      <PiWarningCircleFill
                        color="red"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        data-value="Порог должен быть больше 1000 и кратен 100"
                      />
                    )
                  ) : (
                    <></>
                  )}
                </div>
                {budgetFloorChange ? (
                  <div className={styles.changeInput}>
                    <input
                      type="text"
                      id="budgetFloor"
                      value={budgetFloor}
                      onChange={handleNumberChange(setBudgetFloor)}
                    />
                    <FcCancel
                      className={styles.cancelIcon}
                      onClick={() => setBudgetFloorChange(false)}
                    />
                  </div>
                ) : (
                  <FaRegEdit
                    className={styles.changeButton}
                    onClick={() => setBudgetFloorChange(true)}
                  />
                )}
              </div>
              <div className={styles.settingsRow}>
                <div className={styles.labelRow}>
                  <label htmlFor="replinishmentAmount">Сумма пополнения</label>
                  {replinishmentAmountChange ? (
                    replinishmentAmount >= 1000 &&
                    replinishmentAmount % 100 === 0 ? (
                      <IoCheckmarkCircleSharp color="green" />
                    ) : (
                      <PiWarningCircleFill
                        color="red"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        data-value="Сумма пополнения должна быть больше 1000 и кратна 100"
                      />
                    )
                  ) : (
                    <></>
                  )}
                </div>
                {replinishmentAmountChange ? (
                  <div className={styles.changeInput}>
                    <input
                      type="text"
                      id="replinishmentAmount"
                      value={replinishmentAmount}
                      onChange={handleNumberChange(setReplinishmentAmount)}
                    />
                    <FcCancel
                      className={styles.cancelIcon}
                      onClick={() => setReplinishmentAmountChange(false)}
                    />
                  </div>
                ) : (
                  <FaRegEdit
                    className={styles.changeButton}
                    onClick={() => setReplinishmentAmountChange(true)}
                  />
                )}
              </div>
            </div>
          </div>

          <div>
            <span className={styles.mainLabel}>
              <b>Пороги для отключения кластеров</b>
            </span>

            <div className={styles.settingsSection}>
              <div className={styles.settingsRow}>
                <div className={styles.labelRow}>
                  <label htmlFor="ctrBench">Минимальный CTR</label>
                  {ctrBenchChange ? (
                    ctrBench > 0 ? (
                      <IoCheckmarkCircleSharp color="green" />
                    ) : (
                      <PiWarningCircleFill
                        color="red"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        data-value="Порог CTR должен быть отличным от 0"
                      />
                    )
                  ) : (
                    <></>
                  )}
                </div>
                {ctrBenchChange ? (
                  <div className={styles.changeInput}>
                    <input
                      type="text"
                      id="ctrBench"
                      value={percentInput}
                      onChange={handlePercentInputChange}
                      onBlur={handlePercentBlur}
                    />
                    <FcCancel
                      className={styles.cancelIcon}
                      onClick={() => setCtrBenchChange(false)}
                    />
                  </div>
                ) : (
                  <FaRegEdit
                    className={styles.changeButton}
                    onClick={() => setCtrBenchChange(true)}
                  />
                )}
              </div>
              <div className={styles.settingsRow}>
                <div className={styles.labelRow}>
                  <label htmlFor="viewsBench">Количество просмотров</label>
                  {viewsBenchChange ? (
                    viewsBench > 0 ? (
                      <IoCheckmarkCircleSharp color="green" />
                    ) : (
                      <PiWarningCircleFill
                        color="red"
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        data-value="Порог по просмотрам должен быть отличным от 0"
                      />
                    )
                  ) : (
                    <></>
                  )}
                </div>

                {viewsBenchChange ? (
                  <div className={styles.changeInput}>
                    <input
                      type="text"
                      id="viewsBench"
                      value={viewsBench}
                      onChange={handleNumberChange(setViewsBench)}
                    />
                    <FcCancel
                      className={styles.cancelIcon}
                      onClick={() => setViewsBenchChange(false)}
                    />
                  </div>
                ) : (
                  <FaRegEdit
                    className={styles.changeButton}
                    onClick={() => setViewsBenchChange(true)}
                  />
                )}
              </div>
            </div>
          </div>

          <div>
            <span className={styles.mainLabel}>
              <b>Оборачиваемость</b>
            </span>

            <div className={styles.settingsSection}>
              <div className={styles.settingsRow}>
                <label htmlFor="lowerTurnoverThreshold">
                  Порог оборачивамости
                </label>
                {lowerTurnoverThresholdChange ? (
                  <div className={styles.changeInput}>
                    <input
                      type="text"
                      id="lowerTurnoverThreshold"
                      value={lowerTurnoverThreshold}
                      onChange={handleNumberChange(setLowerTurnoverThreshold)}
                    />
                    <FcCancel
                      className={styles.cancelIcon}
                      onClick={() => setLowerTurnoverThresholdChange(false)}
                    />
                  </div>
                ) : (
                  <FaRegEdit
                    className={styles.changeButton}
                    onClick={() => setLowerTurnoverThresholdChange(true)}
                  />
                )}
              </div>
              <div className={styles.settingsRow}>
                <label htmlFor="turnoverDays">
                  Дней для расчета оборачиваемости
                </label>
                {turnoverDaysChange ? (
                  <div className={styles.changeInput}>
                    <input
                      type="text"
                      id="turnoverDays"
                      value={turnoverDays}
                      onChange={handleNumberChange(setTurnoverDays)}
                    />
                    <FcCancel
                      className={styles.cancelIcon}
                      onClick={() => setTurnoverDaysChange(false)}
                    />
                  </div>
                ) : (
                  <FaRegEdit
                    className={styles.changeButton}
                    onClick={() => setTurnoverDaysChange(true)}
                  />
                )}
              </div>
              {turnoverByBarcodeChange ? (
                <div className={styles.settingsRowCheckbox}>
                  <div className={styles.oneCheckbox}>
                    <input
                      type="checkbox"
                      id="byBC"
                      checked={turnoverByBarcode}
                      onChange={(e) => setTurnoverByBarcodes(e.target.checked)}
                    />

                    <label htmlFor="byBC">По баркодам</label>
                  </div>
                  <div className={styles.oneCheckbox}>
                    <input
                      type="checkbox"
                      id="bySKU"
                      checked={!turnoverByBarcode}
                      onChange={(e) => setTurnoverByBarcodes(!e.target.checked)}
                    />
                    <label htmlFor="bySKU">По артикулам</label>
                  </div>
                  <FcCancel
                    className={styles.cancelIcon}
                    onClick={() => setTurnoverByBarcodesChange(false)}
                  />
                </div>
              ) : (
                <div className={styles.settingsRow}>
                  <label>По баркодам / По артикулам</label>
                  <FaRegEdit
                    className={styles.changeButton}
                    onClick={() => setTurnoverByBarcodesChange(true)}
                  />
                </div>
              )}
            </div>
          </div>
          <div>
            <span className={styles.mainLabel}>
              <b>Время активности</b>
            </span>

            <div className={styles.settingsSection}>
              {hasActiveHoursChange ? (
                <>
                  <div className={styles.settingsRowCheckbox}>
                    <div className={styles.oneCheckbox}>
                      <label htmlFor="hasActiveHours">
                        Установить часы активности
                      </label>
                      <input
                        type="checkbox"
                        id="hasActiveHours"
                        checked={hasActiveHours}
                        onChange={(e) => setHasActiveHours(e.target.checked)}
                      />
                      <FcCancel
                        className={styles.cancelIcon}
                        onClick={() => setHasActiveHoursChange(false)}
                      />
                    </div>
                  </div>
                  <div className={styles.settingsSection}>
                    <div className={styles.settingsRow}>
                      <div className={styles.labelRow}>
                        <label htmlFor="startHour">Начало (час): </label>
                        {hasActiveHoursChange && hasActiveHours ? (
                          startHour !== pauseHour ? (
                            <IoCheckmarkCircleSharp color="green" />
                          ) : (
                            <PiWarningCircleFill
                              color="red"
                              onMouseEnter={handleMouseEnter}
                              onMouseLeave={handleMouseLeave}
                              data-value="Часы начала и окончания должны отличаться"
                            />
                          )
                        ) : (
                          <></>
                        )}
                      </div>

                      <select
                        id="startHour"
                        value={startHour}
                        onChange={(e) => setStartHour(Number(e.target.value))}
                        disabled={!hasActiveHours}
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>
                            {i}:00
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className={styles.settingsRow}>
                      <div className={styles.labelRow}>
                        <label htmlFor="pauseHour">Окончание (час): </label>
                        {hasActiveHoursChange && hasActiveHours ? (
                          startHour !== pauseHour ? (
                            <IoCheckmarkCircleSharp color="green" />
                          ) : (
                            <PiWarningCircleFill
                              color="red"
                              onMouseEnter={handleMouseEnter}
                              onMouseLeave={handleMouseLeave}
                              data-value="Часы начала и окончания должны отличаться"
                            />
                          )
                        ) : (
                          <></>
                        )}
                      </div>

                      <select
                        id="pauseHour"
                        value={pauseHour}
                        onChange={(e) => setPauseHour(Number(e.target.value))}
                        disabled={!hasActiveHours}
                      >
                        {Array.from({ length: 24 }, (_, i) => (
                          <option key={i} value={i}>
                            {i}:00
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </>
              ) : (
                <FaRegEdit
                  className={styles.changeButton}
                  onClick={() => setHasActiveHoursChange(true)}
                />
              )}
            </div>
          </div>

          <div className={styles.actions}>
            <button
              className={
                anythingChanged
                  ? styles.acceptButton
                  : styles.disabledAcceptButton
              }
              onClick={handleClickOnEdit}
              disabled={!anythingChanged || !isCreateEnabled}
            >
              Применить изменения
            </button>
            <button className={styles.cancelButton} onClick={onClose}>
              Отмена
            </button>
          </div>
        </fieldset>
      </div>
      <ConfirmModal
        isOpen={modalData.isOpen}
        text={modalData.text}
        onConfirm={modalData.onConfirm}
        onCancel={closeModal}
      />
    </div>
  );
};

export default EditCampaignsModal;
