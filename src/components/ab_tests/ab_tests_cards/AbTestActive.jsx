import { RiDeleteBin2Fill } from 'react-icons/ri';
import { MdPauseCircleFilled } from 'react-icons/md';
import { FaRegCopy } from 'react-icons/fa';
import { v4 as uuidv4 } from 'uuid';

import { FaPlay } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useState } from 'react';

import styles from './style.module.css';
import {
  deleteABTest,
  pauseABTest,
  startABTest,
} from '../../../redux/slices/abTestsSlice';
import ConfirmModal from '../../confirm_modal/ConfirmModal';
import { hostName } from '../../../utils/host';

const AbTestActive = ({ test }) => {
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
    openConfirmModal(`Вы уверены, что хотите удалить ${test.name}?`, (e) => {
      dispatch(deleteABTest(`${hostName}/ab_tests/delete/${test.testId}`));
    });
  };

  const handleClickOnPause = (e) => {
    e.stopPropagation();
    openConfirmModal(
      `Вы уверены, что хотите поставить на паузу ${test.name}?`,
      (e) => {
        dispatch(pauseABTest(`${hostName}/ab_tests/pause/${test.testId}`));
      }
    );
  };

  const handleClickOnStart = (e) => {
    e.stopPropagation();
    openConfirmModal(`Вы уверены, что хотите запустить ${test.name}?`, (e) => {
      dispatch(startABTest(`${hostName}/ab_tests/run/${test.testId}`));
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
        className={
          test.isOnPause
            ? `${styles.cardActive} ${styles.cardPaused}`
            : `${styles.cardActive}`
        }
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
          <div
            className={`${
              !test.isOnPause ? styles.pointActive : styles.pointInactive
            }`}
          ></div>
          {/* {!test.isOnPause ? (
            <TestingAnimation />
          ) : (
            <FaPause title={test.pauseReason} className={styles.pauseNotif} />
          )} */}
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
          {test.isOnPause ? (
            test.pauseReason == 'Приостановлено вручную.' && (
              <button
                className={styles.buttonContinue}
                onClick={(e) => {
                  e.stopPropagation();
                  handleClickOnStart(e);
                }}
              >
                <FaPlay />
              </button>
            )
          ) : (
            <button
              className={styles.buttonPause}
              onClick={(e) => {
                e.stopPropagation();
                handleClickOnPause(e);
              }}
            >
              <MdPauseCircleFilled />
            </button>
          )}
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

export default AbTestActive;
