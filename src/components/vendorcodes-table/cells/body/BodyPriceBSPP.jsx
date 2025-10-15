import LazyLoad from 'react-lazyload';
import { v4 as uuidv4 } from 'uuid';

import LineplotVC from '../../../lineplot_vc/LineplotVC';
import styles from './style.module.css';

const BodyPriceBSPP = ({ vc, datesFilter }) => {
  return (
    <div className={styles.cell}>
      <LazyLoad key={uuidv4()} offset={100}>
        <div>
          <LineplotVC data={vc.priceBeforeDisc} dates={datesFilter} />
        </div>
      </LazyLoad>
    </div>
  );
};

export default BodyPriceBSPP;
