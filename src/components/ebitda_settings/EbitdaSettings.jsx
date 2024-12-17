import { useEffect, useState } from 'react';
import { FaSpinner } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';

import {
  fetchEbitdaSettings,
  selectEbitdaSettings,
  selectIsLoading,
} from '../../redux/slices/ebitdaSettingsSlice';

import { selectNotificationMessage } from '../../redux/slices/notificationSlice';

import EbitdaSettingsInfo from './ebitda_settings_info/EbitdaSettingsInfo';
import EbitdaSettingsForm from './ebitda_settings_form/EbitdaSettingsForm';

import { hostName } from '../../utils/host';

const EbitdaSettings = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const ebitdaSettings = useSelector(selectEbitdaSettings);
  const notificationMessage = useSelector(selectNotificationMessage);
  const [isEditing, setIsEditing] = useState(false);

  useEffect(() => {
    if (notificationMessage !== '') {
      setIsEditing(false);
    }
  }, [notificationMessage]);

  useEffect(() => {
    if (notificationMessage === '' || isEditing === false) {
      dispatch(fetchEbitdaSettings(`${hostName}/ebitda/`));
    }
  }, [dispatch, notificationMessage, isEditing]);

  return (
    <>
      {isLoading ? (
        <FaSpinner className="spinner" />
      ) : (
        <section>
          <h1>Настройки расчета EBITDA</h1>
          <div>
            {isEditing ? (
              <EbitdaSettingsForm
                defaultData={ebitdaSettings}
                setIsEditing={setIsEditing}
              />
            ) : (
              <EbitdaSettingsInfo
                defaultData={ebitdaSettings}
                setIsEditing={setIsEditing}
              />
            )}
          </div>
        </section>
      )}
    </>
  );
};

export default EbitdaSettings;
