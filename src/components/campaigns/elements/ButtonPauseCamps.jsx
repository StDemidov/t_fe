import { useNavigate } from 'react-router-dom';
import { BsPauseCircleFill } from 'react-icons/bs';

import styles from './style.module.css';
import { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  changeCampaignsStatuses,
  selectChangeIsLoading,
} from '../../../redux/slices/campaignsSlice';
import ConfirmModal from '../../confirm_modal/ConfirmModal';
import { hostName } from '../../../utils/host';

const ButtonPauseCamps = ({ selectedCamps }) => {
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
    const data = selectedCamps.map((item) => Number(item));
    openConfirmModal(
      `Вы уверены, что хотите поставить на паузу кампании (${selectedCamps.length} шт.)?`,
      (e) => {
        dispatch(
          changeCampaignsStatuses({
            data: data,
            url: `${hostName}/ad_camps/change_status/${-11}`,
          })
        );
      }
    );
  };
  return (
    <>
      <button
        className={
          selectedCamps.length === 0
            ? styles.buttonPause
            : styles.buttonPauseActive
        }
        disabled={selectedCamps.length === 0}
        onClick={handleClickOnPause}
      >
        <BsPauseCircleFill className={styles.gear} />
      </button>
      <ConfirmModal
        isOpen={modalData.isOpen}
        text={modalData.text}
        onConfirm={modalData.onConfirm}
        onCancel={closeModal}
      />
    </>
  );
};

export default ButtonPauseCamps;
