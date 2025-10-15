import LazyLoad from 'react-lazyload';
import { v4 as uuidv4 } from 'uuid';

import styles from './style.module.css';
import LineplotVC from '../../../lineplot_vc/LineplotVC';

const BodyAddToCart = ({ vc, datesFilter }) => {
  return (
    <div className={styles.cell}>
      <LazyLoad key={uuidv4()} offset={100}>
        <div>
          <LineplotVC data={vc.addToCart} dates={datesFilter} perc={true} />
        </div>
      </LazyLoad>
    </div>
  );
};

export default BodyAddToCart;
