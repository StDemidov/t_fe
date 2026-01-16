import { useNavigate } from 'react-router-dom';
import { IoSettingsSharp } from 'react-icons/io5';

import styles from './style.module.css';
import EditCampaignsModal from './EditCampaignsModal';
import { useState } from 'react';

const ButtonEditCamps = ({ selectedCamps }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        className={
          selectedCamps.length === 0
            ? styles.buttonEdit
            : styles.buttonEditActive
        }
        disabled={selectedCamps.length === 0}
        onClick={() => setIsOpen(true)}
      >
        <IoSettingsSharp className={styles.gear} />
      </button>

      {isOpen && (
        <EditCampaignsModal
          selectedCamps={selectedCamps}
          onClose={() => setIsOpen(false)}
        />
      )}
    </>
  );
};

export default ButtonEditCamps;
