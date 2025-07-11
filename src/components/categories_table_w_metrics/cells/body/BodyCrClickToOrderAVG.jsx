import { v4 as uuidv4 } from 'uuid';
import styles from '../../style.module.css';
import LineplotAverageCategories from '../../../lineplot_average_categories/LineplotAverageCategories';

const BodyCrClickToOrderAVG = ({ crClickToOrderAVG, total }) => {
  return (
    <div className={`${styles.bodyCell}`} key={uuidv4()}>
      <LineplotAverageCategories
        data={crClickToOrderAVG}
        need_average={false}
        perc={true}
        total={total}
      />
    </div>
  );
};

export default BodyCrClickToOrderAVG;
