import {
  BsPauseCircleFill,
  BsFillPlayCircleFill,
  BsFillXCircleFill,
  BsFillWrenchAdjustableCircleFill,
} from 'react-icons/bs';

import styles from './style.module.css';

const ActionButtons = ({ camp, cellStyle }) => {
  return (
    <div className={`${cellStyle} ${styles.actionButtons}`}>
      <BsPauseCircleFill />
      <BsFillPlayCircleFill />
      <BsFillXCircleFill />
      <BsFillWrenchAdjustableCircleFill />
    </div>
  );
};

export default ActionButtons;
