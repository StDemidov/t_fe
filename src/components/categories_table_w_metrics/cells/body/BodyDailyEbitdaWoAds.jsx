import { v4 as uuidv4 } from 'uuid';
import styles from '../../style.module.css';
import BarplotCategories from '../../../barplot_categories/BarplotCategories';

const BodyDailyEbitdaWoAds = ({ dailyEbitdaWoAds }) => {
  return (
    <div className={`${styles.bodyCell}`} key={uuidv4()}>
      <BarplotCategories data={dailyEbitdaWoAds} need_sum={true} />
    </div>
  );
};

export default BodyDailyEbitdaWoAds;
