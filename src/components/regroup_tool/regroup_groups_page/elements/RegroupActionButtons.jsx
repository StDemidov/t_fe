import { useDispatch, useSelector } from 'react-redux';
import {
  returnToStart,
  selectRegroupedItems,
  updateGroups,
} from '../../../../redux/slices/regroupSlice';

import styles from './style.module.css';
import { hostName } from '../../../../utils/host';
import ConfirmModal from '../../../confirm_modal/ConfirmModal';
import { useState } from 'react';

const RegroupActionButtons = () => {
  const groups = useSelector(selectRegroupedItems);
  const dispatch = useDispatch();
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
  const handleClickOnReturn = () => {
    dispatch(returnToStart());
  };

  const handleClickOnRegroup = (e) => {
    const data = {
      groups: groups.map((innerList) => innerList.map((item) => item.sku)),
    };
    e.stopPropagation();
    e.preventDefault();

    openConfirmModal('Уверены, что хотите перераспределить карточки?', (e) => {
      dispatch(
        updateGroups({
          data: data,
          url: `${hostName}/card_grouping/group_cards_on_wb`,
        })
      );
    });
  };
  return (
    <div className={styles.actionButtons}>
      <button onClick={handleClickOnReturn}>В начало</button>
      <button onClick={handleClickOnRegroup}>Применить распределение</button>
      <ConfirmModal
        isOpen={modalData.isOpen}
        text={modalData.text}
        onConfirm={modalData.onConfirm}
        onCancel={closeModal}
      />
    </div>
  );
};

export default RegroupActionButtons;
