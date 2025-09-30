import { FaSpinner } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import { IoSettings } from 'react-icons/io5';
import styles from './style.module.css';
import { useNavigate } from 'react-router-dom';

import {
  fetchAutoCampaigns,
  selectIsLoading,
  selectAutoCampaigns,
} from '../../redux/slices/autoCampaignsSlice';

import {
  selectAutoCampBrandFilter,
  selectAutoCampCreatedByFilter,
  selectAutoCampStatusFilter,
  selectAutoCampCampNamFilter,
  selectAutoCampSortingType,
  selectAutoCampHasActiveHoursFilter,
} from '../../redux/slices/filterSlice';
import { hostName } from '../../utils/host';
import AutoCampaignsTable from '../autocampaigns_table/AutoCampaignsTable';
import AutoCampaignsFilters from '../autocampaigns_filters/AutoCampaignsFilters';

const AutoCampaignsList = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const cmpgns = useSelector(selectAutoCampaigns);
  const brandFilter = useSelector(selectAutoCampBrandFilter);
  const statusFilter = useSelector(selectAutoCampStatusFilter);
  const createdByFilter = useSelector(selectAutoCampCreatedByFilter);
  const selectedSorting = useSelector(selectAutoCampSortingType);
  const nameFilter = useSelector(selectAutoCampCampNamFilter);
  const hasActiveHours = useSelector(selectAutoCampHasActiveHoursFilter);
  const navigation = useNavigate();

  const animStyles = useSpring({
    loop: false,
    from: { opacity: '0' },
    to: { opacity: '1' },
    config: { duration: '600' },
  });

  useEffect(() => {
    dispatch(fetchAutoCampaigns(`${hostName}/autocampaigns/`));
  }, [dispatch]);

  const filteredVCMetrics = cmpgns.filter((cmpgn) => {
    let brandMatch = true;
    let createdByMatch = true;
    let statusMatch = true;
    let nameMatch = true;
    let activeHoursMatch = true;
    if (brandFilter !== '') {
      brandMatch = cmpgn.brand === brandFilter;
    }
    if (createdByFilter !== '') {
      createdByMatch = cmpgn.createdBy === createdByFilter;
    }
    if (statusFilter.length !== 0) {
      statusMatch = statusFilter.includes(cmpgn.status);
    }
    if (nameFilter.length !== 0) {
      if (isNaN(nameFilter)) {
        nameMatch = cmpgn.campName
          .toLowerCase()
          .includes(nameFilter.toLowerCase());
      } else {
        nameMatch = cmpgn.sku.toLowerCase().includes(nameFilter);
      }
    }
    if (hasActiveHours !== 'Все') {
      let hoursFlag = true;
      hasActiveHours === 'Без часов активности'
        ? (hoursFlag = false)
        : (hoursFlag = true);
      activeHoursMatch = cmpgn.hasActiveHours === hoursFlag;
    }

    return (
      brandMatch &&
      createdByMatch &&
      statusMatch &&
      nameMatch &&
      activeHoursMatch
    );
  });

  const handleClickOnCreate = (event) => {
    navigation(`/tools/auto_campaigns/create`);
  };

  const handleClickOnSettings = (event) => {
    navigation(`/tools/auto_campaigns_settings`);
  };

  getSortedData(filteredVCMetrics, selectedSorting);

  return (
    <>
      {isLoading ? (
        <FaSpinner className="spinner" />
      ) : (
        <animated.div style={{ ...animStyles }}>
          <section>
            <h1>
              Автоматические кампании
              <IoSettings
                className={styles.settingsButton}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClickOnSettings(e);
                }}
              />
            </h1>
            <button
              className={styles.buttonCreate}
              onClick={(e) => {
                e.stopPropagation();
                handleClickOnCreate(e);
              }}
            >
              Создать кампанию
            </button>
            <AutoCampaignsFilters cmpgns={cmpgns} />
            <AutoCampaignsTable cmpgns={filteredVCMetrics} />
          </section>
        </animated.div>
      )}
    </>
  );
};

export default AutoCampaignsList;

const getSortedData = (data, selectedSorting) => {
  switch (selectedSorting) {
    case 'CTR ↓':
      data.sort((a, b) =>
        (a.ctr * 100).toFixed(2) > (b.ctr * 100).toFixed(2) ? -1 : 1
      );
      break;
    case 'CTR ↑':
      data.sort((a, b) =>
        (a.ctr * 100).toFixed(2) > (b.ctr * 100).toFixed(2) ? 1 : -1
      );
      break;
    case 'Затраты ↓':
      data.sort((a, b) => (a.totalSpend > b.totalSpend ? -1 : 1));
      break;
    case 'Затраты ↑':
      data.sort((a, b) => (a.totalSpend > b.totalSpend ? 1 : -1));
      break;
    default:
      data.sort((a, b) =>
        (a.ctr * 100).toFixed(2) > (b.ctr * 100).toFixed(2) ? -1 : 1
      );
  }
};
