import LazyLoad from 'react-lazyload';
import { v4 as uuidv4 } from 'uuid';

import styles from './style.module.css';
import LineplotVC from '../../../lineplot_vc/LineplotVC';

const BodyCartToOrder = ({ vc, datesFilter }) => {
  return (
    <div className={styles.cell}>
      <LazyLoad key={uuidv4()} offset={100}>
        <div>
          {/* <LineplotVC data={vc.cartToOrder} dates={datesFilter} /> */}
          {console.log(vc.cartToOrder)}
          <div
            className={styles.summary}
            style={
              vc.cartToOrderAVG ? { display: 'block' } : { display: 'none' }
            }
          >
            Среднее: {vc.cartToOrderAVG} %
          </div>
        </div>
      </LazyLoad>
    </div>
  );
};

export default BodyCartToOrder;
