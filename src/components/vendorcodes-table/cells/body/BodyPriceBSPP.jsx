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
          <div
            className={styles.summary}
            style={
              vc.priceBeforeDisc.at(-1)
                ? { display: 'block' }
                : { display: 'none' }
            }
          >
            Последняя: {vc.priceBeforeDisc.at(-1).toLocaleString()} ₽
          </div>
        </div>
      </LazyLoad>
    </div>
  );
};

export default BodyPriceBSPP;
