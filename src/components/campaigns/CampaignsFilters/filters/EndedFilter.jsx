import React from 'react';
import SwitchActivity from '../../CampaignPage/elements/clusters_table/SwitchActivity';
import {
  selectFilterEnded,
  setFilterEnded,
} from '../../../../redux/slices/campaignsSlice';
import { useDispatch, useSelector } from 'react-redux';

import styles from './style.module.css';

const EndedFilter = () => {
  const ended = useSelector(selectFilterEnded);
  const dispatch = useDispatch();

  const onToggleDisabled = () => {
    const newValue = !ended;
    dispatch(setFilterEnded(newValue));
  };

  return (
    <div className={styles.endedFilter}>
      <SwitchActivity checked={ended} onChange={onToggleDisabled} />
      Завершенные
    </div>
  );
};

export default EndedFilter;
