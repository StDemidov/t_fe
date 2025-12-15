import StatusTag from './elements/StatusTag';

import styles from './style.module.css';

const StatusCell = ({ camp, cellStyle }) => {
  return (
    <div className={`${cellStyle} ${styles.statusCell}`}>
      <StatusTag camp={camp} />
    </div>
  );
};

export default StatusCell;
