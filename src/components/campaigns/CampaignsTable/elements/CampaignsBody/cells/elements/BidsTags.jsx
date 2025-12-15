import { FaThumbsUp, FaSearch } from 'react-icons/fa';

import styles from './style.module.css';

const BidsTags = ({ camp }) => {
  return (
    <div className={styles.bidsTagsBox}>
      {camp.bidType === 'unified' ? (
        <div className={styles.bidAmount}>{camp.searchBid}</div>
      ) : (
        <>
          <div className={styles.bidRowTag}>
            <FaSearch
              className={camp.searchPlacement ? '' : styles.disabledPlacement}
            />
            <div className={styles.bidAmount}>
              {camp.searchPlacement ? camp.searchBid : '-'}
            </div>
          </div>
          <div className={styles.bidRowTag}>
            <FaThumbsUp
              className={camp.recPlacement ? '' : styles.disabledPlacement}
            />
            <div className={styles.bidAmount}>
              {camp.recPlacement ? camp.recBid : '-'}
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default BidsTags;
