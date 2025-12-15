import { useEffect, useState } from 'react';

import ConfirmModal from '../../../../../confirm_modal/ConfirmModal';
import { createCampaigns } from '../../../../../../redux/slices/campaignsSlice';
import styles from './style.module.css';
import { useDispatch } from 'react-redux';
import { hostName } from '../../../../../../utils/host';

const Step3CampSettings = ({
  settings,
  setCurrentStep,
  setSettings,
  setLastStep,
}) => {
  const dispatch = useDispatch();
  const [searchPlacement, setSearchPlacement] = useState(
    settings.bidType === 'unified' ? true : false
  );
  const [recPlacement, setRecPlacement] = useState(
    settings.bidType === 'unified' ? true : false
  );
  const [searchBid, setSearchBid] = useState(0);
  const [recBid, setRecBid] = useState(0);

  const [balanceType, setBalanceType] = useState(1);
  const [currBudget, setCurrBudget] = useState(2000);
  const [budgetFloor, setBudgetFloor] = useState(1000);
  const [replinishmentAmount, setReplinishmentAmount] = useState(1000);

  const [ctrBench, setCtrBench] = useState(0.01);
  const [percentInput, setPercentInput] = useState((ctrBench * 100).toString());
  const [viewsBench, setViewsBench] = useState(100);

  const [lowerTurnoverThreshold, setLowerTurnoverThreshold] = useState(10);
  const [turnoverDays, setTurnoverDays] = useState(4);
  const [turnoverByBarcode, setTurnoverByBarcodes] = useState(true);

  const [hasActiveHours, setHasActiveHours] = useState(false);
  const [startHour, setStartHour] = useState(0);
  const [pauseHour, setPauseHour] = useState(0);

  const [isCreateEnabled, setIsCreateEnabled] = useState(false);

  const [modalData, setModalData] = useState({
    isOpen: false,
    text: '',
    onConfirm: null,
  });

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

  const closeModal = () => {
    setModalData({ ...modalData, isOpen: false });
  };

  const setUnifiedBid = (value) => {
    setSearchBid(value);
    setRecBid(value);
  };

  const checkAllConditions = () => {
    // 1) ctrBench больше нуля
    const condition1 = ctrBench > 0;

    // 2) viewsBench больше нуля
    const condition2 = viewsBench > 0;

    // 3) либо searchPlacement либо recPlacement должны быть true (хотя бы один)
    const condition3 = searchPlacement || recPlacement;

    // При этом, если searchPlacement == true то searchBid должен быть больше нуля
    const searchBidValid =
      !searchPlacement || (searchPlacement && searchBid > 0);

    // если recPlacement, то recBid должен быть больше нуля
    const recBidValid = !recPlacement || (recPlacement && recBid > 0);

    const condition3Full = condition3 && searchBidValid && recBidValid;

    // 4) settings.skuList - длина должна быть больше нуля
    const condition4 = settings.skuList && settings.skuList.length > 0;

    // 5) lowerTurnoverThreshold - должен быть больше или равен 0
    const condition5 = lowerTurnoverThreshold >= 0;

    // 6) Если hasActiveHours == True, то startHour не должен быть равен pauseHour
    const condition6 =
      !hasActiveHours || (hasActiveHours && startHour !== pauseHour);

    // 7) TurnoverDays должен быть больше 0
    const condition7 = turnoverDays > 0;

    // 8) currBudget должен быть больше или равен 2000 и кратен 100
    const condition8 = currBudget >= 2000 && currBudget % 100 === 0;

    // 9) budgetFloor должен быть больше или равен 1000 и кратен 100
    const condition9 = budgetFloor >= 1000 && budgetFloor % 100 === 0;

    // 10) replinishmentAmount должен быть больше или равен 1000 и кратен 100
    const condition10 =
      replinishmentAmount >= 1000 && replinishmentAmount % 100 === 0;

    // Проверяем все условия
    return (
      condition1 &&
      condition2 &&
      condition3Full &&
      condition4 &&
      condition5 &&
      condition6 &&
      condition7 &&
      condition8 &&
      condition9 &&
      condition10
    );
  };

  // Эффект для проверки условий при изменении зависимостей
  useEffect(() => {
    setSettings({
      ...settings,
      settings: {
        ctrBench: ctrBench,
        viewsBench: viewsBench,
        searchPlacement: searchPlacement,
        recPlacement: recPlacement,
        searchBid: searchBid,
        recBid: recBid,
        lowerTurnoverThreshold: lowerTurnoverThreshold,
        hasActiveHours: hasActiveHours,
        startHour: startHour,
        pauseHour: pauseHour,
        turnoverDays: turnoverDays,
        currBudget: currBudget,
        budgetFloor: budgetFloor,
        replinishmentAmount: replinishmentAmount,
      },
    });
    setIsCreateEnabled(checkAllConditions());
  }, [
    ctrBench,
    viewsBench,
    searchPlacement,
    recPlacement,
    searchBid,
    recBid,
    settings.skuList,
    lowerTurnoverThreshold,
    hasActiveHours,
    startHour,
    pauseHour,
    turnoverDays,
    currBudget,
    budgetFloor,
    replinishmentAmount,
  ]);

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

  const handleClickOnCreate = (e) => {
    e.stopPropagation();
    e.preventDefault();
    openConfirmModal(`Вы подтверждаете создание кампаний?`, (e) => {
      const data = settings.skuList.map((item) => {
        return {
          sku: String(item.sku),
          parent_camp_id:
            item.manualCampActive >= 0
              ? item.manualCampActive
              : item.unifiedCampActive >= 0
              ? item.unifiedCampActive
              : -1,
          bid_type: settings.bidType,
          search_placement: searchPlacement,
          rec_placement: recPlacement,
          search_bid: searchBid,
          rec_bid: recBid,
          curr_budget: currBudget,
          balance_type: 1,
          budget_floor: budgetFloor,
          replinishment_amount: replinishmentAmount,
          ctr_bench: Number(ctrBench),
          views_bench: viewsBench,
          lower_turnover_threshold: lowerTurnoverThreshold,
          turnover_days: turnoverDays,
          turnover_by_barcodes: turnoverByBarcode,
          has_active_hours: hasActiveHours,
          start_hour: hasActiveHours ? startHour : -1,
          pause_hour: hasActiveHours ? pauseHour : -1,
        };
      });
      dispatch(
        createCampaigns({
          data: data,
          url: `${hostName}/ad_camps/`,
        })
      );
    });
  };

  return (
    <>
      <div>
        <fieldset className={styles.settingsBox}>
          <legend className={styles.legend}>Настройки кампаний</legend>
          <div>
            <div>
              <span>
                <b>Места размещения</b>
              </span>
              <div>
                <input
                  type="checkbox"
                  id="searchCheckbox"
                  checked={searchPlacement}
                  disabled={settings.bidType === 'unified'}
                  onChange={(e) => setSearchPlacement(e.target.checked)}
                />
                <label htmlFor="searchCheckbox">Поиск</label>
                <input
                  type="checkbox"
                  id="recCheckbox"
                  checked={recPlacement}
                  disabled={settings.bidType === 'unified'}
                  onChange={(e) => setRecPlacement(e.target.checked)}
                />
                <label htmlFor="recCheckbox">Рекомендации</label>
              </div>
            </div>
            <div>
              <span>
                <b>Ставки</b>
              </span>

              <div>
                {settings.bidType === 'unified' ? (
                  <>
                    <label>Общая</label>
                    <input
                      type="text"
                      id="searchBid"
                      value={searchBid}
                      disabled={!searchPlacement}
                      onChange={handleNumberChange(setUnifiedBid)}
                    />
                  </>
                ) : (
                  <>
                    <label htmlFor="searchBid">Поиск</label>
                    <input
                      type="text"
                      id="searchBid"
                      value={searchBid}
                      disabled={!searchPlacement}
                      onChange={handleNumberChange(setSearchBid)}
                    />
                    <label htmlFor="recBid">Рекомендации</label>
                    <input
                      type="text"
                      id="recBid"
                      value={recBid}
                      disabled={!recPlacement}
                      onChange={handleNumberChange(setRecBid)}
                    />
                  </>
                )}
              </div>
            </div>
            <div>
              <span>
                <b>Бюджет</b>
              </span>

              <div>
                <label htmlFor="currBudget">Стартовый бюджет</label>
                <input
                  type="text"
                  id="currBudget"
                  value={currBudget}
                  onChange={handleNumberChange(setCurrBudget)}
                />
                <label htmlFor="budgetFloor">Порог для пополнения</label>
                <input
                  type="text"
                  id="budgetFloor"
                  value={budgetFloor}
                  onChange={handleNumberChange(setBudgetFloor)}
                />
                <label htmlFor="replinishmentAmount">Сумма пополнения</label>
                <input
                  type="text"
                  id="replinishmentAmount"
                  value={replinishmentAmount}
                  onChange={handleNumberChange(setReplinishmentAmount)}
                />
              </div>
            </div>
            <div>
              <span>
                <b>Пороги для отключения кластеров</b>
              </span>

              <div>
                <label htmlFor="ctrBench">Минимальный CTR</label>
                <input
                  type="text"
                  id="ctrBench"
                  value={percentInput}
                  onChange={handlePercentInputChange}
                  onBlur={handlePercentBlur}
                />
                <label htmlFor="viewsBench">Количество просмотров</label>
                <input
                  type="text"
                  id="viewsBench"
                  value={viewsBench}
                  onChange={handleNumberChange(setViewsBench)}
                />
              </div>
            </div>
            <div>
              <span>
                <b>Оборачиваемость</b>
              </span>

              <div>
                <label htmlFor="lowerTurnoverThreshold">
                  Порог оборачивамости
                </label>
                <input
                  type="text"
                  id="lowerTurnoverThreshold"
                  value={lowerTurnoverThreshold}
                  onChange={handleNumberChange(setLowerTurnoverThreshold)}
                />
                <label htmlFor="turnoverDays">
                  Количество дней для расчета оборачиваемости
                </label>
                <input
                  type="text"
                  id="turnoverDays"
                  value={turnoverDays}
                  onChange={handleNumberChange(setTurnoverDays)}
                />
                <div>
                  <input
                    type="checkbox"
                    id="byBC"
                    checked={turnoverByBarcode}
                    onChange={(e) => setTurnoverByBarcodes(e.target.checked)}
                  />
                  <label htmlFor="byBC">По баркодам</label>
                  <input
                    type="checkbox"
                    id="bySKU"
                    checked={!turnoverByBarcode}
                    onChange={(e) => setTurnoverByBarcodes(!e.target.checked)}
                  />
                  <label htmlFor="bySKU">По артикулам</label>
                </div>
              </div>
            </div>
            <div>
              <span>
                <b>Время активности</b>
              </span>

              <div>
                <label htmlFor="hasActiveHours">
                  Установить часы активности
                </label>
                <input
                  type="checkbox"
                  id="hasActiveHours"
                  checked={hasActiveHours}
                  onChange={(e) => setHasActiveHours(e.target.checked)}
                />
                <div className={styles.timePicker}>
                  <label htmlFor="startHour">Начало (час): </label>
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
                  <label htmlFor="pauseHour">Окончание (час): </label>
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
            </div>
          </div>
        </fieldset>
        <button disabled={!isCreateEnabled} onClick={handleClickOnCreate}>
          Создать кампании
        </button>
      </div>
      <ConfirmModal
        isOpen={modalData.isOpen}
        text={modalData.text}
        onConfirm={modalData.onConfirm}
        onCancel={closeModal}
      />
    </>
  );
};

export default Step3CampSettings;
