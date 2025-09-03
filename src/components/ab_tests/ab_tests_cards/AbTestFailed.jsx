import { useDispatch } from 'react-redux';

import { MdOutlineRestartAlt } from 'react-icons/md';
import { RiDeleteBin2Fill } from 'react-icons/ri';
import { IoMdSettings } from 'react-icons/io';
import { useState } from 'react';

import styles from './style.module.css';
import {
  deleteABTest,
  restartABTest,
} from '../../../redux/slices/abTestsSlice';
import ConfirmModal from '../../confirm_modal/ConfirmModal';
import { hostName } from '../../../utils/host';

const AbTestFailed = ({ test }) => {
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

  const handleClickOnRestart = (e) => {
    e.stopPropagation();
    // dispatch(restartABTest(`${hostName}/sse/ab_tests/create/${test.testId}`));
  };

  const handleClickOnDelete = (e) => {
    e.stopPropagation();

    openConfirmModal(`Вы уверены, что хотите удалить ${test.name}?`, () => {
      dispatch(deleteABTest(`${hostName}/ab_tests/delete/${test.testId}`));
    });
  };

  return (
    <div className={styles.cardFailed} key={test.ad_id}>
      <div
        className={styles.cardImageFailed}
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.2), rgba(93, 50, 212, 0.2)), url(${test.image})`,
        }}
      ></div>
      <div className={styles.baseInfoFailed}>
        <div className={styles.infoRow}>
          <div className={styles.infoLabel}>SKU</div>
          <div>{test.sku}</div>
          <div className={styles.infoLabelLong}>Показов</div>
          <div>{test.viewsGoal}</div>
          <div className={styles.infoLabel}>CPM</div>
          <div>{test.cpm}</div>
        </div>
      </div>

      <div className={styles.buttonsFailed}>
        <div className={styles.buttonRestart}>
          <MdOutlineRestartAlt onClick={handleClickOnRestart} />
        </div>
        <div className={styles.buttonDelete}>
          <RiDeleteBin2Fill onClick={handleClickOnDelete} />
        </div>
      </div>
      <ConfirmModal
        isOpen={modalData.isOpen}
        text={modalData.text}
        onConfirm={modalData.onConfirm}
        onCancel={closeModal}
      />
    </div>
  );
};

export default AbTestFailed;
