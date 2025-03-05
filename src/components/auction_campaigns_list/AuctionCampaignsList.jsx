import { FaSpinner } from 'react-icons/fa';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { useSpring, animated } from '@react-spring/web';
import styles from './style.module.css';
import { useNavigate } from 'react-router-dom';

import {
  fetchAucCampaigns,
  selectIsLoading,
  selectAucCampaigns,
} from '../../redux/slices/aucCampaignsSlice';

// import {
//   selectAutoCampBrandFilter,
//   selectAutoCampCreatedByFilter,
//   selectAutoCampStatusFilter,
//   selectAutoCampCampNamFilter,
// } from '../../redux/slices/filterSlice';
import { hostName } from '../../utils/host';
import AuctionCampaignsTable from '../auction_campaigns_table/AuctionCampaignsTable';

const AuctionCampaignsList = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const cmpgns = useSelector(selectAucCampaigns);
  // const brandFilter = useSelector(selectAutoCampBrandFilter);
  // const statusFilter = useSelector(selectAutoCampStatusFilter);
  // const createdByFilter = useSelector(selectAutoCampCreatedByFilter);
  // const nameFilter = useSelector(selectAutoCampCampNamFilter);
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

  // const filteredVCMetrics = cmpgns.filter((cmpgn) => {
  //   let brandMatch = true;
  //   let createdByMatch = true;
  //   let statusMatch = true;
  //   let nameMatch = true;
  //   if (brandFilter !== '') {
  //     brandMatch = cmpgn.brand === brandFilter;
  //   }
  //   if (createdByFilter !== '') {
  //     createdByMatch = cmpgn.createdBy === createdByFilter;
  //   }
  //   if (statusFilter.length !== 0) {
  //     statusMatch = statusFilter.includes(cmpgn.status);
  //   }
  //   if (nameFilter.length !== 0) {
  //     if (isNaN(nameFilter)) {
  //       nameMatch = cmpgn.campName
  //         .toLowerCase()
  //         .includes(nameFilter.toLowerCase());
  //     } else {
  //       nameMatch = cmpgn.sku.toLowerCase().includes(nameFilter);
  //     }
  //   }

  //   return brandMatch && createdByMatch && statusMatch && nameMatch;
  // });

  return (
    <>
      {isLoading ? (
        <FaSpinner className="spinner" />
      ) : (
        <animated.div style={{ ...animStyles }}>
          <section>
            <h1>Аукцион</h1>
            <AuctionCampaignsTable cmpgns={cmpgns} />
          </section>
        </animated.div>
      )}
    </>
  );
};

export default AuctionCampaignsList;
