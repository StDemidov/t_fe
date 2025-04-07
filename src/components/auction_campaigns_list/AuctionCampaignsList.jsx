import { FaSpinner } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import styles from './style.module.css';

import {
  fetchAucCampaigns,
  selectIsLoading,
  selectAucCampaigns,
} from '../../redux/slices/aucCampaignsSlice';

import {
  selectAucCampCampNameFilter,
  selectAucCampStatusFilter,
  selectAucSortingType,
} from '../../redux/slices/filterSlice';
import { hostName } from '../../utils/host';
import AuctionCampaignsTable from '../auction_campaigns_table/AuctionCampaignsTable';
import AucCampaignsFilters from '../auccampaigns_filters/AucCampaignsFilters';
import { useNavigate } from 'react-router-dom';

const AuctionCampaignsList = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const cmpgns = useSelector(selectAucCampaigns);
  const statusFilter = useSelector(selectAucCampStatusFilter);
  const nameFilter = useSelector(selectAucCampCampNameFilter);
  const selectedSorting = useSelector(selectAucSortingType);
  const navigation = useNavigate();

  const animStyles = useSpring({
    loop: false,
    from: { opacity: '0' },
    to: { opacity: '1' },
    config: { duration: '600' },
  });

  useEffect(() => {
    dispatch(fetchAucCampaigns(`${hostName}/auctioncampaigns/`));
  }, [dispatch]);

  const filteredCamps = cmpgns.filter((cmpgn) => {
    let statusMatch = true;
    let nameMatch = true;
    if (statusFilter.length !== 0) {
      statusMatch = statusFilter.includes(cmpgn.status);
    }
    if (nameFilter.length !== 0) {
      if (isNaN(nameFilter)) {
        nameMatch = cmpgn.vcName
          .toLowerCase()
          .includes(nameFilter.toLowerCase());
      } else {
        nameMatch = cmpgn.sku.toLowerCase().includes(nameFilter);
      }
    }

    return statusMatch && nameMatch;
  });

  const handleClickOnCreate = (event) => {
    navigation(`/tools/auction_campaigns/create_from_id`);
  };

  getSortedData(filteredCamps, selectedSorting);

  return (
    <>
      {isLoading ? (
        <FaSpinner className="spinner" />
      ) : (
        <animated.div style={{ ...animStyles }}>
          <section>
            <h1>Аукцион</h1>
            <button
              className={styles.buttonCreate}
              onClick={(e) => {
                e.stopPropagation();
                handleClickOnCreate(e);
              }}
            >
              Создать кампанию
            </button>
            <AucCampaignsFilters />
            <AuctionCampaignsTable cmpgns={filteredCamps} />
          </section>
        </animated.div>
      )}
    </>
  );
};

export default AuctionCampaignsList;

const getSortedData = (data, selectedSorting) => {
  switch (selectedSorting) {
    case 'CTR ↓':
      data.sort((a, b) => (a.ctr > b.ctr ? -1 : 1));
      break;
    case 'CTR ↑':
      data.sort((a, b) => (a.ctr > b.ctr ? 1 : -1));
      break;
    case 'Затраты ↓':
      data.sort((a, b) => (a.totalSpend > b.totalSpend ? -1 : 1));
      break;
    case 'Затраты ↑':
      data.sort((a, b) => (a.totalSpend > b.totalSpend ? 1 : -1));
      break;
    default:
      data.sort((a, b) => (a.ctr > b.ctr ? -1 : 1));
  }
};
