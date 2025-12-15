import BidsTags from './elements/BidsTags';
import styles from './style.module.css';

const BidsCell = ({ camp, cellStyle }) => {
  return (
    <div className={`${cellStyle} ${styles.bidsCell}`}>
      <BidsTags camp={camp} />
    </div>
  );
};

export default BidsCell;
