import { BsDatabaseAdd } from 'react-icons/bs';

import styles from './style.module.css';

const BodyDeadline = ({ vc }) => {
  return !(vc.deadline === '-' || vc.deadline === 0) ? (
    <div className={`${styles.cell} ${styles.cellDeadline}`}>
      <div className={`${styles.deadlineDate}`}>
        <div
          className={`${
            vc.deadline > vc.turnoverWBBuyout
              ? styles.deadlineGreen
              : styles.deadlineRed
          }`}
        >
          {addDays(vc.deadline)}
        </div>
        <div className={styles.deadlineDays}>{vc.deadline} д.</div>
      </div>
      <div className={styles.refillDate}>
        <BsDatabaseAdd /> <span>{vc.lastStockRefill}</span>
      </div>
    </div>
  ) : (
    <div className={`${styles.cell} ${styles.cellDeadline}`}>
      <div className={`${styles.deadlineGray}`}>
        <div>{vc.deadline}</div>
      </div>
      <div className={styles.refillDate}>
        <BsDatabaseAdd /> <span>{vc.lastStockRefill}</span>
      </div>{' '}
    </div>
  );
};

export default BodyDeadline;

function addDays(n) {
  const date = new Date(); // Создаем объект с текущей датой
  date.setDate(date.getDate() + n); // Устанавливаем дату на n дней вперед

  const year = date.getFullYear(); // Получаем год
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Получаем месяц (начиная с 0, добавляем 1 и дополняем нулем)
  const day = String(date.getDate()).padStart(2, '0'); // Получаем день (дополняем нулем)

  return `${year}-${month}-${day}`; // Форматируем в год-месяц-число
}
