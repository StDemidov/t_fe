import BidTypeTag from './elements/BidTypeTag';

import styles from './style.module.css';

const BidTypeCell = ({ bidType, cellStyle }) => {
  return (
    <div className={`${cellStyle} ${styles.bidTypeCell}`}>
      <BidTypeTag bidType={bidType} />
    </div>
  );
};

export default BidTypeCell;
