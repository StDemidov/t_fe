import { v4 as uuidv4 } from 'uuid';
import { TbPointFilled } from 'react-icons/tb';
import { TbPoint } from 'react-icons/tb';

import styles from './style.module.css';

const CampaignsHeader = ({
  columns,
  selectedCamps,
  setSelectedCamps,
  campaigns,
}) => {
  const handleClickOnUnpick = () => {
    if (selectedCamps.length !== 0) {
      setSelectedCamps([]);
    }
  };
  const handleClickOnPick = () => {
    const newSelected = campaigns.map((camp) => {
      return camp.campId;
    });
    setSelectedCamps([...selectedCamps, ...newSelected]);
  };
  const headerCellRender = (baseClass, text) => {
    return (
      <div key={uuidv4()} className={`${baseClass} ${styles.headerCell}`}>
        {text !== 'base' ? (
          text
        ) : (
          <div className={styles.pick}>
            <TbPoint onClick={handleClickOnUnpick} />
            <TbPointFilled onClick={handleClickOnPick} />
          </div>
        )}
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
