import LazyLoad from 'react-lazyload';
import { v4 as uuidv4 } from 'uuid';

import BarplotVC from '../../../barplot_vc/BarplotVC';
import styles from './style.module.css';

const BodyOrders = ({ vc, datesFilter }) => {
  return (
    <div className={styles.cell}>
      <LazyLoad key={uuidv4()} offset={100}>
        <div>
          <BarplotVC data={vc.wbOrdersTotal} dates={datesFilter} />
          <div
            className={styles.summary}
            style={vc.ordersSum ? { display: 'block' } : { display: 'none' }}
          >
            Итого: {vc.ordersSum.toLocaleString()}
          </div>
        </div>
      </LazyLoad>
    </div>
  );
};

export default BodyOrders;
