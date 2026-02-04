import { getDate } from '../../../../utils/beaty';
import { PiCoinsBold } from 'react-icons/pi';

import { MdRocketLaunch } from 'react-icons/md';
import { HiPauseCircle } from 'react-icons/hi2';
import { BsSignStopFill } from 'react-icons/bs';

import styles from './style.module.css';

const ChangesLogs = ({ logs, dates }) => {
  if (!dates.startDate) {
    return <></>;
  }
  let endDate = new Date(dates.endDate);
  endDate.setHours(23, 59, 59, 999);

  return (
    <div className={styles.changesLogs}>
      <div className={styles.logsHeader}>История изменений</div>
      <div className={styles.logsList}>
        {logs.map((log, i) => {
          if (log.changeDate <= endDate && log.changeDate >= dates.startDate) {
            const type = log.changeText.split(':')[0];
            const text = log.changeText.split(':')[1];
            return (
              <div key={i} className={styles.logRow}>
                <div className={styles.logDate}>
                  {getDate(log.changeDate, true)}
                </div>
                <div className={styles.typeIcon}>{ICONS[type]}</div>
                <div className={styles.logText}>{text}</div>
                <div className={styles.logAuthor}>{log.author}</div>
              </div>
            );
          }
        })}
      </div>
    </div>
  );
};

const ICONS = {
  BUDGET: <PiCoinsBold />,
  STARTED: <MdRocketLaunch />,
  PAUSED: <HiPauseCircle />,
  ENDED: <BsSignStopFill />,
};

export default ChangesLogs;
