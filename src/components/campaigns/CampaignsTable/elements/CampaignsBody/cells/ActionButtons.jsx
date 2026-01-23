import {
  BsPauseCircleFill,
  BsFillPlayCircleFill,
  BsFillXCircleFill,
  BsFillWrenchAdjustableCircleFill,
} from 'react-icons/bs';
import { TbLoaderQuarter } from 'react-icons/tb';
import { MdOutlineQueryStats } from 'react-icons/md';

import { useDispatch, useSelector } from 'react-redux';

import {
  changeCampaignStatus,
  selectChangeIsLoading,
} from '../../../../../../redux/slices/campaignsSlice';

import { hostName } from '../../../../../../utils/host';
import styles from './style.module.css';
import ConfirmModal from '../../../../../confirm_modal/ConfirmModal';
import { useState } from 'react';
import { Link } from 'react-router-dom';

const ActionButtons = ({ camp, cellStyle }) => {
  const dispatch = useDispatch();
  const changeIsLoading = useSelector(selectChangeIsLoading);
  const [modalData, setModalData] = useState({
    isOpen: false,
    text: '',
    onConfirm: null,
  });

  const openConfirmModal = (text, onConfirm) => {
    setModalData({
      isOpen: true,
      text,
      onConfirm: () => {
        onConfirm();
        setModalData({ ...modalData, isOpen: false });
      },
    });
  };

  const closeModal = () => {
    setModalData({ ...modalData, isOpen: false });
  };

  const handleClickOnPause = (event) => {
    const campId = Number(camp.campId);
    openConfirmModal(
      `Вы уверены, что хотите поставить на паузу кампанию ${camp.campId}?`,
      (e) => {
        dispatch(
          changeCampaignStatus(`${hostName}/ad_camps/pause_camp/${campId}`)
        );
      }
    );
  };
  const handleClickOnRun = (event) => {
    const campId = Number(camp.campId);
    openConfirmModal(
      `Вы уверены, что хотите запустить кампанию ${camp.campId}?`,
      (e) => {
        dispatch(
          changeCampaignStatus(`${hostName}/ad_camps/launch_camp/${campId}`)
        );
      }
    );
  };
  return (
    <>
      <div className={`${cellStyle} ${styles.actionButtons}`}>
        {changeIsLoading ? (
          <TbLoaderQuarter />
        ) : (
          <>
            {/* <Link
              to={`/tools/campaigns/${camp.id}`}
              target="_blank"
              className={styles.statsButton}
            >
              <MdOutlineQueryStats />
            </Link> */}
            {[9, 11].includes(camp.status) & !camp.pausedByUser ? (
              <BsPauseCircleFill
                className={styles.pauseButton}
                onClick={handleClickOnPause}
              />
            ) : (
              <></>
            )}
            {(camp.status == 11) & camp.pausedByUser ? (
              <BsFillPlayCircleFill
                className={styles.launchButton}
                onClick={handleClickOnRun}
              />
            ) : (
              <></>
            )}
            {/* 
          <BsFillXCircleFill />
          <BsFillWrenchAdjustableCircleFill /> */}
          </>
        )}
      </div>
      <ConfirmModal
        isOpen={modalData.isOpen}
        text={modalData.text}
        onConfirm={modalData.onConfirm}
        onCancel={closeModal}
      />
    </>
  );
};

export default ActionButtons;
