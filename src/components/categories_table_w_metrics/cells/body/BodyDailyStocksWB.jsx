import { v4 as uuidv4 } from 'uuid';
import styles from '../../style.module.css';
import BarplotCategories from '../../../barplot_categories/BarplotCategories';

const BodyDailyStocksWB = ({ stocksWB }) => {
  return (
    <div className={`${styles.bodyCell}`} key={uuidv4()}>
      <BarplotCategories data={stocksWB} need_sum={true} last_item={true} />
    </div>
  );
};

export default BodyDailyStocksWB;
