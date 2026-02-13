import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { format } from 'date-fns';

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
  selectFilterCategory,
  selectFilterEnded,
  selectFilterStatus,
  selectFilterTableDates,
  selectFilterType,
  selectIsLoading,
  selectSortingType,
  setCurrentPage,
} from '../../redux/slices/campaignsSlice';
import TablesPaginator from '../tables_paginator/TablesPaginator';

import styles from './style.module.css';
import ButtonCreateCamps from './elements/ButtonCreateCamps';
import { selectCampaignsFilterSKU } from '../../redux/slices/filterSlice';
import ButtonEditCamps from './elements/ButtonEditCamps';
import ButtonXLSX from './elements/ButtonXLSX';
import ButtonPauseCamps from './elements/ButtonPauseCamps';
import ButtonRestartCamps from './elements/ButtonRestartCamps';
import ButtonEndCamps from './elements/ButtonEndCamps';

const CampaignsList = () => {
  const campaignsOnPage = 50;
  const dispatch = useDispatch();
  const campaigns = useSelector(selectCampaigns);
  const isLoading = useSelector(selectIsLoading);
  const currentPage = useSelector(selectCurrentPage);
  const dates = useSelector(selectDates);
  const datesFilter = useSelector(selectFilterTableDates);
  const [selectedCamps, setSelectedCamps] = useState([]);

  const skuNameFilter = useSelector(selectCampaignsFilterSKU);
  const endedFilter = useSelector(selectFilterEnded);
  const statusFilter = useSelector(selectFilterStatus);
  const typeFilter = useSelector(selectFilterType);
  const categoryFilter = useSelector(selectFilterCategory);
  const selectedSorting = useSelector(selectSortingType);

  useEffect(() => {
    dispatch(fetchDates(`${hostName}/ad_camps/dates`));
  }, []);

  useEffect(() => {
    if (datesFilter.startDate && datesFilter.endDate) {
      const start = format(datesFilter.startDate, 'yyyy-MM-dd');
      const end = format(datesFilter.endDate, 'yyyy-MM-dd');
      dispatch(
        fetchCampaigns(
          `${hostName}/ad_camps/w_dates/?start_date=${start}&end_date=${end}`
        )
      );
    }
  }, [datesFilter.startDate, datesFilter.endDate]);

  const filteredCampaigns = campaigns.filter((camp) => {
    let skuNameMatch = true;
    let endedMatch = true;
    let statusMatch = true;
    let typeMatch = true;
    let categoryMatch = true;

    if (skuNameFilter.length != 0) {
      if (isNaN(skuNameFilter)) {
        skuNameMatch = camp.skuName
          .toLowerCase()
          .includes(skuNameFilter.toLowerCase());
      } else {
        skuNameMatch = camp.sku.includes(skuNameFilter);
      }
    }
    if (endedFilter === false) {
      endedMatch = camp.endDate == '';
    }
    if (statusFilter.length) {
      statusMatch = statusFilter.includes(camp.status);
    }
    if (typeFilter.length) {
      typeMatch = typeFilter.includes(camp.bidType);
    }
    if (categoryFilter.length) {
      categoryMatch = categoryFilter.includes(camp.category);
    }
    return (
      skuNameMatch && endedMatch && statusMatch && typeMatch && categoryMatch
    );
  });

  getSortedData(filteredCampaigns, selectedSorting);

  const chunkedCampaigns = chunkArray(filteredCampaigns, campaignsOnPage);
  const numOfPages = chunkedCampaigns.length;

  return (
    <section>
      <div className={styles.h1Row}>
        <div className={styles.h1Box}>
          <h1>Кампании</h1>
          <ButtonXLSX camps={filteredCampaigns} />
          <div className={styles.lastUpdate}>Обновлено: {dates.end}</div>
        </div>
        <div className={styles.buttonsGroup}>
          <ButtonRestartCamps selectedCamps={selectedCamps} />
          <ButtonPauseCamps selectedCamps={selectedCamps} />
          <ButtonEndCamps selectedCamps={selectedCamps} />
          <ButtonEditCamps selectedCamps={selectedCamps} />
          <ButtonCreateCamps />
        </div>
      </div>
      {isLoading ? (
        <></>
      ) : (
        <>
          <CampaignsFilters campaigns={campaigns} />
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

const getSortedData = (data, selectedSorting) => {
  switch (selectedSorting) {
    case 'Дата создания ↓':
      data.sort((a, b) => (a.creationDateDT > b.creationDateDT ? -1 : 1));
      break;
    case 'Дата создания ↑':
      data.sort((a, b) => (a.creationDateDT > b.creationDateDT ? 1 : -1));
      break;
    case 'Показы ↓':
      data.sort((a, b) => (a.sumViews > b.sumViews ? -1 : 1));
      break;
    case 'Показы ↑':
      data.sort((a, b) => (a.sumViews > b.sumViews ? 1 : -1));
      break;
    case 'Клики ↓':
      data.sort((a, b) => (a.sumClicks > b.sumClicks ? -1 : 1));
      break;
    case 'Клики ↑':
      data.sort((a, b) => (a.sumClicks > b.sumClicks ? 1 : -1));
      break;
    case 'Траты ↓':
      data.sort((a, b) => (a.sumSpend > b.sumSpend ? -1 : 1));
      break;
    case 'Траты ↑':
      data.sort((a, b) => (a.sumSpend > b.sumSpend ? 1 : -1));
      break;
    case 'Полные затраты ↓':
      data.sort((a, b) => (a.totalSpend > b.totalSpend ? -1 : 1));
      break;
    case 'Полные затраты ↑':
      data.sort((a, b) => (a.totalSpend > b.totalSpend ? 1 : -1));
      break;
    case 'CTR ↓':
      data.sort((a, b) => (a.currentCtr > b.currentCtr ? -1 : 1));
      break;
    case 'CTR ↑':
      data.sort((a, b) => (a.currentCtr > b.currentCtr ? 1 : -1));
      break;
    case 'Полный CTR ↓':
      data.sort((a, b) => (a.totalCtr > b.totalCtr ? -1 : 1));
      break;
    case 'Полный CTR ↑':
      data.sort((a, b) => (a.totalCtr > b.totalCtr ? 1 : -1));
      break;
    default:
      data.sort((a, b) => (a.debSum > b.debSum ? -1 : 1));
  }
};
