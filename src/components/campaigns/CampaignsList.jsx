import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import CampaignsFilters from './CampaignsFilters/CampaignsFilters';
import CampaignsTable from './CampaignsTable/CampaignsTable';

import { chunkArray } from '../../utils/base_utils/data_slicing';
import { hostName } from '../../utils/host';
import {
  fetchCampaigns,
  fetchDates,
  selectCampaigns,
  selectCurrentPage,
  selectDates,
  selectIsLoading,
  setCurrentPage,
} from '../../redux/slices/campaignsSlice';
import TablesPaginator from '../tables_paginator/TablesPaginator';

import styles from './style.module.css';
import ButtonCreateCamps from './elements/ButtonCreateCamps';

const CampaignsList = () => {
  const campaignsOnPage = 50;
  const dispatch = useDispatch();
  const campaigns = useSelector(selectCampaigns);
  const isLoading = useSelector(selectIsLoading);
  const currentPage = useSelector(selectCurrentPage);
  const dates = useSelector(selectDates);
  console.log(dates);

  useEffect(() => {
    dispatch(fetchDates(`${hostName}/ad_camps/dates`));
    dispatch(fetchCampaigns(`${hostName}/ad_camps/`));
  }, []);

  const chunkedCampaigns = chunkArray(campaigns, campaignsOnPage);
  const numOfPages = chunkedCampaigns.length;

  return (
    <section>
      <div className={styles.h1Row}>
        <div className={styles.h1Box}>
          <h1>Кампании</h1>
          <div className={styles.lastUpdate}>Обновлено: {dates.end}</div>
        </div>
        <ButtonCreateCamps />
      </div>
      {isLoading ? (
        <></>
      ) : (
        <>
          <CampaignsFilters />
          <CampaignsTable
            campaigns={chunkedCampaigns[currentPage - 1]}
            dates={dates}
          />
          <TablesPaginator
            currentPage={currentPage}
            numOfPages={numOfPages}
            setPageFunction={setCurrentPage}
          />
        </>
      )}
    </section>
  );
};

export default CampaignsList;
