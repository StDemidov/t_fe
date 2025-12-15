import styles from './style.module.css';

const CampaignsHeader = ({ columns }) => {
  const headerCellRender = (baseClass, text) => {
    return (
      <div key={text} className={`${baseClass} ${styles.headerCell}`}>
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
