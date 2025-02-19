import LazyLoad from 'react-lazyload';
import { v4 as uuidv4 } from 'uuid';

import LineplotVC from '../../../lineplot_vc/LineplotVC';
import styles from './style.module.css';

const BodyCPO = ({ vc, datesFilter }) => {
  return (
    <div className={styles.cell}>
      <LazyLoad key={uuidv4()} offset={100}>
        <div>
          <LineplotVC data={vc.costPerOrder} dates={datesFilter} />
          <div
            className={styles.summary}
            style={
              vc.costPerOrderAVG ? { display: 'block' } : { display: 'none' }
            }
          >
            Среднее: {vc.costPerOrderAVG} ₽
          </div>
        </div>
      </LazyLoad>
    </div>
  );
};

export default BodyCPO;
