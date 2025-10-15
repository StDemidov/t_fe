import LazyLoad from 'react-lazyload';
import { v4 as uuidv4 } from 'uuid';

import BarplotVCRaw from '../../../barplot_vc_raw/BarplotVCRaw';
import styles from './style.module.css';

const BodySales = ({ vc, datesFilter }) => {
  return (
    <div className={styles.cell}>
      <LazyLoad key={uuidv4()} offset={100}>
        <div>
          <BarplotVCRaw
            data={vc.sales}
            raw_data={vc.rawSales}
            dates={datesFilter}
          />
        </div>
      </LazyLoad>
    </div>
  );
};

export default BodySales;
