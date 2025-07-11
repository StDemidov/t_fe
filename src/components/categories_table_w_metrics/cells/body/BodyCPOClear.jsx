import { v4 as uuidv4 } from 'uuid';
import styles from '../../style.module.css';
import LineplotAverageCategories from '../../../lineplot_average_categories/LineplotAverageCategories';

const BodyCPOClear = ({ cpoClear }) => {
  return (
    <div className={`${styles.bodyCell}`} key={uuidv4()}>
      <LineplotAverageCategories data={cpoClear} need_average={true} />
    </div>
  );
};

export default BodyCPOClear;
