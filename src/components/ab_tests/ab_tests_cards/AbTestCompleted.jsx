import { IoDiamondOutline } from 'react-icons/io5';
import { RiDeleteBin2Fill } from 'react-icons/ri';
import { v4 as uuidv4 } from 'uuid';

import styles from './style.module.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { deleteABTest } from '../../../redux/slices/abTestsSlice';
import ConfirmModal from '../../confirm_modal/ConfirmModal';
import { hostName } from '../../../utils/host';

const AbTestCompleted = ({ test }) => {
  const navigation = useNavigate();
  const dispatch = useDispatch();
  const handleClickOnCard = () => {
    navigation(`/tools/ab_tests/info/${test.testId}`);
  };

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

  const handleClickOnDelete = (e) => {
    openConfirmModal(`Вы уверены, что хотите удалить ${test.name}?`, (e) => {
      dispatch(deleteABTest(`${hostName}/ab_tests/delete/${test.testId}`));
    });
  };
  return (
    <>
      <div
        className={styles.cardCompleted}
        key={test.ad_id}
        onClick={handleClickOnCard}
      >
        <div
          className={styles.cardImage}
          style={{
            backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.2), rgba(93, 50, 212, 0.2)), url(${
              test.image
            }?v=${uuidv4()})`,
          }}
        >
          <IoDiamondOutline className={styles.animateRainbow} />
        </div>
        <div className={styles.baseInfo}>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>Тест</div>
            <div>{test.name}</div>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>ID РК</div>
            <div>{test.adId}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabel}>SKU</div>
            <div>{test.sku}</div>
          </div>
        </div>
        <div className={styles.settingsInfo}>
          <div className={styles.infoRow}>
            <div className={styles.infoLabelLong}>Показов</div>
            <div>{test.viewsGoal}</div>
          </div>

          <div className={styles.infoRow}>
            <div className={styles.infoLabelLong}>CPM</div>
            <div>{test.cpm}</div>
          </div>
          <div className={styles.infoRow}>
            <div className={styles.infoLabelLong}>Дата старта</div>
            <div>{test.startDate}</div>
          </div>
        </div>
        <div className={styles.buttons}>
          <button
            className={styles.buttonDelete}
            onClick={(e) => {
              e.stopPropagation();
              handleClickOnDelete(e);
            }}
          >
            <RiDeleteBin2Fill />
          </button>
        </div>
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

export default AbTestCompleted;
