import { IoDiamondOutline } from 'react-icons/io5';
import { RiDeleteBin2Fill } from 'react-icons/ri';
import { FaRegCopy } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

import styles from './style.module.css';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { deleteABTest } from '../../../redux/slices/abTestsSlice';
import ConfirmModal from '../../confirm_modal/ConfirmModal';
import { hostName } from '../../../utils/host';

const AbTestCompleted = ({ test }) => {
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

  const handleClickOnDelete = (e) => {
    e.stopPropagation();
    e.preventDefault();
    openConfirmModal(`Вы уверены, что хотите удалить ${test.name}?`, (e) => {
      dispatch(deleteABTest(`${hostName}/ab_tests/delete/${test.testId}`));
    });
  };

  const handleCopy = (event) => {
    event.stopPropagation(); // Останавливаем всплытие
    event.preventDefault(); // Предотвращаем переход по ссылке (если нужно)

    navigator.clipboard.writeText(
      event.currentTarget.getAttribute('data-value')
    );
  };
  return (
    <>
      <Link
        className={styles.cardCompleted}
        key={test.testId}
        to={`/tools/ab_tests/info/${test.testId}`}
        target="_blank"
        style={{ textDecoration: 'none', color: 'inherit' }}
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
            <div>{test.vcName}</div>
            <FaRegCopy
              size={12}
              data-value={test.vcName}
              onClick={handleCopy}
              style={{ cursor: 'pointer' }}
              className={styles.copyIcon}
            />
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
      </Link>
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
