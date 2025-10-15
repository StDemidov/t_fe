import LazyLoad from 'react-lazyload';
import { v4 as uuidv4 } from 'uuid';

import BarplotVCRaw from '../../../barplot_vc_raw/BarplotVCRaw';
import styles from './style.module.css';

const BodyDailyEbitdaWOAds = ({ vc, datesFilter }) => {
  return (
    <div className={styles.cell}>
      <LazyLoad key={uuidv4()} offset={100}>
        <div>
          <BarplotVCRaw
            data={vc.dailyEbitdaWoAds}
            raw_data={vc.dailyEbitdaWoAdsRaw}
            dates={datesFilter}
          />
        </div>
      </LazyLoad>
    </div>
  );
};

export default BodyDailyEbitdaWOAds;
