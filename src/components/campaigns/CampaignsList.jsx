import { useEffect, useState } from 'react';
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
import { selectCampaignsFilterSKU } from '../../redux/slices/filterSlice';
import ButtonEditCamps from './elements/ButtonEditCamps';

const CampaignsList = () => {
  const campaignsOnPage = 50;
  const dispatch = useDispatch();
  const campaigns = useSelector(selectCampaigns);
  const isLoading = useSelector(selectIsLoading);
  const currentPage = useSelector(selectCurrentPage);
  const dates = useSelector(selectDates);
  const [selectedCamps, setSelectedCamps] = useState([]);

  const skuNameFilter = useSelector(selectCampaignsFilterSKU);

  useEffect(() => {
    dispatch(fetchDates(`${hostName}/ad_camps/dates`));
    dispatch(fetchCampaigns(`${hostName}/ad_camps/`));
  }, []);

  const filteredCampaigns = campaigns.filter((camp) => {
    let skuNameMatch = true;

    if (skuNameFilter.length != 0) {
      if (isNaN(skuNameFilter)) {
        skuNameMatch = camp.skuName
          .toLowerCase()
          .includes(skuNameFilter.toLowerCase());
      } else {
        skuNameMatch = camp.sku.includes(skuNameFilter);
      }
    }
    return skuNameMatch;
  });

  const chunkedCampaigns = chunkArray(filteredCampaigns, campaignsOnPage);
  const numOfPages = chunkedCampaigns.length;

  return (
    <section>
      <div className={styles.h1Row}>
        <div className={styles.h1Box}>
          <h1>Кампании</h1>
          <div className={styles.lastUpdate}>Обновлено: {dates.end}</div>
        </div>
        <div className={styles.buttonsGroup}>
          <ButtonEditCamps selectedCamps={selectedCamps} />
          <ButtonCreateCamps />
        </div>
      </div>
      {isLoading ? (
        <></>
      ) : (
        <>
          <CampaignsFilters />
          <CampaignsTable
            campaigns={
              currentPage > chunkedCampaigns.length
                ? chunkedCampaigns[0]
                : chunkedCampaigns[currentPage - 1]
            }
            dates={dates}
            selectedCamps={selectedCamps}
            setSelectedCamps={setSelectedCamps}
          />
          <TablesPaginator
            currentPage={
              currentPage > chunkedCampaigns.length ? 1 : currentPage
            }
            numOfPages={numOfPages}
            setPageFunction={setCurrentPage}
          />
        </>
      )}
    </section>
  );
};

export default CampaignsList;
