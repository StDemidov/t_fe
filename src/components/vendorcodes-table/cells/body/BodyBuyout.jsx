import DoughnutVCPlot from '../../../doughnut_vc_plot/DoughnutVCPlot';
import styles from './style.module.css';

const BodyBuyout = ({ vc }) => {
  return (
    <div className={`${styles.cell} ${styles.cellBuyout}`}>
      <DoughnutVCPlot buyoutPercAVG={vc.buyoutP} />
    </div>
  );
};

export default BodyBuyout;
