import { IoDiamondOutline } from 'react-icons/io5';
import { RiDeleteBin2Fill } from 'react-icons/ri';

import styles from './style.module.css';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { deleteABTest } from '../../../redux/slices/abTestsSlice';
import { hostName } from '../../../utils/host';

const AbTestCompleted = ({ test }) => {
  const navigation = useNavigate();
  const dispatch = useDispatch();
  const handleClickOnCard = () => {
    navigation(`/tools/ab_tests/info/${test.testId}`);
  };
  const handleClickOnDelete = (e) => {
    e.stopPropagation();
    dispatch(deleteABTest(`${hostName}/ab_tests/delete/${test.testId}`));
  };
  return (
    <div
      className={styles.cardCompleted}
      key={test.ad_id}
      onClick={handleClickOnCard}
    >
      <div
        className={styles.cardImage}
        style={{
          backgroundImage: `linear-gradient(rgba(255, 255, 255, 0.2), rgba(93, 50, 212, 0.2)), url(${test.image})`,
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
        <div className={styles.buttonDelete}>
          <RiDeleteBin2Fill onClick={handleClickOnDelete} />
        </div>
      </div>
    </div>
  );
};

export default AbTestCompleted;
