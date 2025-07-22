import React from 'react';
import styles from './style.module.css';

const ConfirmModal = ({ isOpen, text, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <p className={styles.modalText}>{text}</p>
        <div className={styles.modalButtons}>
          <button onClick={onConfirm} className={styles.confirmBtn}>
            Подтвердить
          </button>
          <button onClick={onCancel} className={styles.cancelBtn}>
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
