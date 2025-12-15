import styles from './style.module.css';

const BidTypeTag = ({ bidType }) => {
  const text = bidType === 'manual' ? 'Ручная' : 'Единая';
  return <div className={styles.bidTypeTag}>{text}</div>;
};

export default BidTypeTag;
