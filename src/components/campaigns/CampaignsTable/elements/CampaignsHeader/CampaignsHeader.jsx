import { v4 as uuidv4 } from 'uuid';
import styles from './style.module.css';

const CampaignsHeader = ({ columns }) => {
  const headerCellRender = (baseClass, text) => {
    return (
      <div key={uuidv4()} className={`${baseClass} ${styles.headerCell}`}>
        {text}
      </div>
    );
  };
  return (
    <div className={styles.tableHeader}>
      {columns.map((col) => {
        if (!col.hidden) {
          return headerCellRender(col.cellStyle, col.label);
        }
      })}
    </div>
  );
};

export default CampaignsHeader;
