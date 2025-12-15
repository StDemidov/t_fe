import { useState } from 'react';
import Step1BidTypeSelect from './elements/Step1BidTypeSelect';

import styles from './style.module.css';
import Step2SkuSelect from './elements/Step2SkuSelect';
import Step3CampSettings from './elements/Step3CampSettings';

const CampaignsCreateForm = ({
  existingCampaigns,
  templates,
  settings,
  setSettings,
}) => {
  const [currentStep, setCurrentStep] = useState(1);
  const [lastStep, setLastStep] = useState(1);
  const steps = {
    1: (
      <Step1BidTypeSelect
        settings={settings}
        setSettings={setSettings}
        setCurrentStep={setCurrentStep}
        setLastStep={setLastStep}
      />
    ),
    2: (
      <Step2SkuSelect
        settings={settings}
        setSettings={setSettings}
        setCurrentStep={setCurrentStep}
        existingCampaigns={existingCampaigns}
        setLastStep={setLastStep}
      />
    ),
    3: (
      <Step3CampSettings
        settings={settings}
        setSettings={setSettings}
        setCurrentStep={setCurrentStep}
        existingCampaigns={existingCampaigns}
        setLastStep={setLastStep}
      />
    ),
  };

  return (
    <div className={styles.formBox}>
      <div className={styles.steps}>
        {Object.keys(steps).map((key) => {
          return (
            <button
              key={`step${key}`}
              onClick={() => setCurrentStep(Number(key))}
              disabled={lastStep < key}
            >
              Шаг {key}
            </button>
          );
        })}
      </div>
      <div>
        <div className={styles.formBody}>{steps[currentStep]}</div>
      </div>
    </div>
  );
};

export default CampaignsCreateForm;
