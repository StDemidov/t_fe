import LazyLoad from 'react-lazyload';
import { v4 as uuidv4 } from 'uuid';

import BarplotVC from '../../../barplot_vc/BarplotVC';
import styles from './style.module.css';

const BodyADSCosts = ({ vc, datesFilter }) => {
  return (
    <div className={styles.cell}>
      <LazyLoad key={uuidv4()} offset={100}>
        <div>
          <BarplotVC data={vc.adsCosts} dates={datesFilter} />
          <div
            className={styles.summary}
            style={vc.adsCostsSum ? { display: 'block' } : { display: 'none' }}
          >
            <div
              className={styles.summary}
              style={
                vc.adsCostsSum ? { display: 'block' } : { display: 'none' }
              }
            >
              Итого: {vc.adsCostsSum.toLocaleString()}
            </div>
          </div>
        </div>
      </LazyLoad>
    </div>
  );
};

export default BodyADSCosts;
