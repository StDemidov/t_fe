import { v4 as uuidv4 } from 'uuid';
import styles from '../../style.module.css';
import DoughnutPlot from '../../../doughnut_plot/DoughnutPlot';

const BodyBuyoutPercAVG = ({ buyoutPercAVG, benchmark = 50 }) => {
  return (
    <div className={`${styles.bodyCell}`} key={uuidv4()}>
      <DoughnutPlot buyoutPercAVG={buyoutPercAVG} benchmark={benchmark} />
    </div>
  );
};

export default BodyBuyoutPercAVG;
