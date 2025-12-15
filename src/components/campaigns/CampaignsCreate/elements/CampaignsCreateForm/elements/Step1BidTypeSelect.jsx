import { useState } from 'react';
import styles from './style.module.css';

const Step1BidTypeSelect = ({
  settings,
  setCurrentStep,
  setSettings,
  setLastStep,
}) => {
  const [chosenType, setChosenType] = useState(settings.bidType);

  const setBidType = () => {
    setSettings({ ...settings, bidType: chosenType });
    setCurrentStep(2);
    if (settings.skuList.length === 0) {
      setLastStep(2);
    }
  };

  return (
    <div>
      <fieldset className={styles.bidTypeBox}>
        <legend className={styles.legend}>Выберите тип ставки</legend>
        <div className={styles.bidTypeChose} data-value={'unified'}>
          <input
            type="checkbox"
            id="unified"
            value="unified"
            checked={chosenType === 'unified'}
            onChange={(e) => setChosenType(e.target.value)}
          />
          <label htmlFor="unified">Единая</label>
        </div>
        <div className={styles.bidTypeChose} data-value={'manual'}>
          <input
            type="checkbox"
            id="manual"
            value="manual"
            checked={chosenType === 'manual'}
            onChange={(e) => setChosenType(e.target.value)}
          />
          <label htmlFor="manual">Ручная</label>
        </div>
      </fieldset>
      <button onClick={setBidType} disabled={chosenType === ''}>
        Продолжить
      </button>
    </div>
  );
};

export default Step1BidTypeSelect;
