import LazyLoad from 'react-lazyload';
import { v4 as uuidv4 } from 'uuid';

import BarplotVC from '../../../barplot_vc/BarplotVC';
import styles from './style.module.css';

const BodyWBStocks = ({ vc, datesFilter }) => {
  return (
    <div className={styles.cell}>
      <LazyLoad key={uuidv4()} offset={100}>
        <div>
          <BarplotVC
            data={vc.wbStocksTotal}
            dates={datesFilter}
            need_sum={true}
            last_item={true}
          />
        </div>
      </LazyLoad>
    </div>
  );
};

export default BodyWBStocks;

const getSum = (data) => {
  var sumData = data.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);
  return sumData;
};
