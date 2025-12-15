import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import CampaignsCreateForm from './elements/CampaignsCreateForm/CampaignsCreateForm';
import CampaignsCreateSummary from './elements/CampaignsCreateSummary/CampaignsCreateSummary';
import {
  fetchSkuData,
  selectSkuData,
} from '../../../redux/slices/campaignsSlice';

import { hostName } from '../../../utils/host';
import styles from './style.module.css';

const CampaignsCreate = () => {
  const dispatch = useDispatch();
  const existingCampaigns = useSelector(selectSkuData);
  const [settings, setSettings] = useState({
    bidType: '',
    skuList: [],
    settings: null,
  });

  useEffect(() => {
    dispatch(fetchSkuData(`${hostName}/ad_camps/existing_camps`));
  }, []);

  return (
    <section>
      <h1>Создание кампаний</h1>
      <div className={styles.createBox}>
        <CampaignsCreateForm
          existingCampaigns={existingCampaigns}
          settings={settings}
          setSettings={setSettings}
        />
        <CampaignsCreateSummary settings={settings} />
      </div>
    </section>
  );
};

export default CampaignsCreate;
