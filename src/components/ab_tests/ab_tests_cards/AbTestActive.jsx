import { RiDeleteBin2Fill } from 'react-icons/ri';
import { MdPauseCircleFilled } from 'react-icons/md';
import { LuPause } from 'react-icons/lu';

import { FaPause, FaPlay } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

import styles from './style.module.css';
import TestingAnimation from '../../testing_animation/TestingAnimation';

const AbTestActive = ({ test }) => {
  const navigation = useNavigate();
  const handleClickOnCard = () => {
    navigation(`/tools/ab_tests/info/${test.testId}`);
  };
  return (
    <div
      className={
        test.isOnPause
          ? `${styles.cardActive} ${styles.cardPaused}`
          : `${styles.cardActive}`
      }
      key={test.ad_id}
      onClick={handleClickOnCard}
    >
      <div
        className={styles.cardImage}
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.2), rgba(93, 50, 212, 0.2)), url(${test.image})`,
        }}
      >
        {!test.isOnPause ? (
          <TestingAnimation />
        ) : (
          <FaPause title={test.pauseReason} className={styles.pauseNotif} />
        )}
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
        {test.isOnPause ? (
          test.pauseReason == 'Остановлено пользователем' && (
            <div className={styles.buttonContinue}>
              <FaPlay />
            </div>
          )
        ) : (
          <div className={styles.buttonPause}>
            <MdPauseCircleFilled />
          </div>
        )}
        <div className={styles.buttonDelete}>
          <RiDeleteBin2Fill />
        </div>
      </div>
    </div>
  );
};

export default AbTestActive;
