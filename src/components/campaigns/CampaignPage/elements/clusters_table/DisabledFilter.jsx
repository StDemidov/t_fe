import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  selectShowClustersDisabled,
  setShowClustersDisabled,
} from '../../../../../redux/slices/campaignsSlice';

import styles from './style.module.css';

const DisabledFilter = () => {
  const showDisabled = useSelector(selectShowClustersDisabled);
  const dispatch = useDispatch();

  const onToggleDisabled = () => {
    const newValue = !showDisabled;
    dispatch(setShowClustersDisabled(newValue));
  };
  return (
    <div className={styles.showDisabledFilter}>
      <button
        type="button"
        className={`${styles.switch} ${showDisabled ? styles.on : ''}`}
        onClick={() => onToggleDisabled(!showDisabled)}
        aria-pressed={showDisabled}
      >
        <span className={styles.slider} />
      </button>
      Отображать неактивные
    </div>
  );
};

export default DisabledFilter;
