import { MdOutlineRestartAlt } from 'react-icons/md';
import { RiDeleteBin2Fill } from 'react-icons/ri';
import { IoMdSettings } from 'react-icons/io';

import styles from './style.module.css';
import TestingAnimation from '../../testing_animation/TestingAnimation';

const AbTestFailed = ({ test }) => {
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
          <MdOutlineRestartAlt />
        </div>
        <div className={styles.buttonDeleteFailed}>
          <RiDeleteBin2Fill />
        </div>
      </div>
    </div>
  );
};

export default AbTestFailed;
