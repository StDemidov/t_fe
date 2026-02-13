import { BsPauseCircleFill, BsFillPlayCircleFill } from 'react-icons/bs';
import { MdDeleteForever } from 'react-icons/md';

import { TbLoaderQuarter } from 'react-icons/tb';
import { MdOutlineQueryStats } from 'react-icons/md';
import { FaRegStopCircle } from 'react-icons/fa';

import { useDispatch, useSelector } from 'react-redux';

import {
  changeCampaignStatus,
  deleteCampaign,
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
  const handleClickOnStop = (event) => {
    const campId = Number(camp.campId);
    openConfirmModal(
      `Вы уверены, что хотите завершить кампанию ${camp.campId}?`,
      (e) => {
        dispatch(
          changeCampaignStatus(`${hostName}/ad_camps/end_camp/${campId}`)
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
  const handleClickOnDelete = (event) => {
    const campId = Number(camp.campId);
    openConfirmModal(
      `Вы уверены, что хотите безвозвратно удалить кампанию ${camp.campId}?`,
      (e) => {
        dispatch(deleteCampaign(`${hostName}/ad_camps/delete_camp/${campId}`));
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
            <Link
              to={`/tools/campaigns/${camp.id}`}
              target="_blank"
              className={styles.statsButton}
            >
              <MdOutlineQueryStats />
            </Link>
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
            {camp.status == 12 ? (
              <MdDeleteForever
                className={styles.pauseButton}
                onClick={handleClickOnDelete}
              />
            ) : (
              <></>
            )}
            {[9, 11].includes(camp.status) ? (
              <FaRegStopCircle
                className={styles.pauseButton}
                onClick={handleClickOnStop}
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
