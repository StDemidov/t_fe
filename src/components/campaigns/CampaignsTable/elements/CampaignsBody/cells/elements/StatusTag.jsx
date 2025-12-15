import { FaUser } from 'react-icons/fa';
import { FaClock } from 'react-icons/fa6';
import { FaStoreAltSlash } from 'react-icons/fa';

import styles from './style.module.css';

const StatusTag = ({ camp }) => {
  var statusText = STATUSES[camp.status].text;
  var icon = '';
  if (camp.pausedByTime) {
    icon = <FaClock />;
  } else if (camp.pausedByTurnover) {
    icon = <FaStoreAltSlash />;
  } else if (camp.pausedByUser) {
    icon = <FaUser />;
  }
  return (
    <div className={`${styles.statusTag} ${STATUSES[camp.status].className}`}>
      <span>{statusText}</span>
      {icon}
    </div>
  );
};

const STATUSES = {
  11: {
    text: 'На паузе',
    className: styles.pausedStatus,
  },
  9: {
    text: 'Активна',
    className: styles.activeStatus,
  },
  4: {
    text: 'Готова к запуску',
    className: styles.waitingForLaunch,
  },
  12: {
    text: 'Завершена',
    className: styles.endedStatus,
  },
  '-1': {
    text: 'Создается',
    className: styles.waitingForLaunch,
  },
  '-2': {
    text: 'Установка CPM',
    className: styles.waitingForLaunch,
  },
  '-3': {
    text: 'Пополняем бюджеты',
    className: styles.waitingForLaunch,
  },
  '-4': {
    text: 'Ждет старта',
    className: styles.waitingForLaunch,
  },
  '-5': {
    text: 'Ошибка создания',
    className: styles.errorStatus,
  },
  '-6': {
    text: 'Ошибка бюджета',
    className: styles.errorStatus,
  },
  '-7': {
    text: 'Ошибка запуска',
    className: styles.errorStatus,
  },
  '-8': {
    text: 'Ошибка пополнения',
    className: styles.errorStatus,
  },
  '-9': {
    text: 'Ошибка завершения',
    className: styles.errorStatus,
  },
  '-10': {
    text: 'Ошибка ставок',
    className: styles.errorStatus,
  },
};

export default StatusTag;
