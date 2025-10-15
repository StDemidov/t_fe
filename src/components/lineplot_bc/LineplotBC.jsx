import { Line } from 'react-chartjs-2';
import { PiEmptyDuotone } from 'react-icons/pi';
import styles from './style.module.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement);

const LineplotBC = ({ data, dates }) => {
  const startDate = new Date(dates.start);
  const endDate = new Date(dates.end);

  var labels = getDateNumberArray(data);

  data = getDataForPeriod(data, startDate, endDate);
  let sum = data.reduce((acc, num) => acc + num, 0);
  if (sum === 0) {
    return <PiEmptyDuotone color="red" />;
  }
  labels = getDataForPeriod(labels, startDate, endDate);
  const chartData = {
    labels,
    datasets: [
      {
        data: data,
        borderColor: 'rgba(130, 84, 255, 1)',
        backgroundColor: 'rgba(130, 84, 255, 0.3)',
        borderWidth: 0.7,
        pointRadius: 0.7,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false },
      tooltip: {
        enabled: true,
        yAlign: 'top',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: { size: 6, weight: 'bold' },
        bodyFont: { size: 8 },
        padding: { top: 4, right: 6, bottom: 4, left: 6 },
      },
    },
    scales: {
      x: { display: false },
      y: { display: false, beginAtZero: true },
    },
  };

  return (
    <div
      className={styles.lineDiv}
      style={{ width: '100px', height: '50px', textAlign: 'center' }}
    >
      <Line data={chartData} options={options} />
    </div>
  );
};

export default LineplotBC;

function getDateNumberArray(dataArray) {
  // Определяем вчерашнюю дату
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Функция для форматирования даты в формате "день - номер месяца"
  const formatDateNumber = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Месяцы начинаются с 0, поэтому +1
    return `${day}.${String(month).length === 1 ? '0' + String(month) : month}`;
  };

  // Создаем массив с датами на основе длины массива чисел
  const datesArray = [];
  for (let i = dataArray.length - 1; i >= 0; i--) {
    // Каждая дата уменьшается на i дней от вчерашнего дня
    const date = new Date(yesterday);
    date.setDate(yesterday.getDate() - i);
    datesArray.push(formatDateNumber(date));
  }

  return datesArray;
}

const getDataForPeriod = (data, startDate, endDate) => {
  const todayDate = new Date();
  const startIndex = Math.ceil((todayDate - startDate) / (1000 * 60 * 60 * 24)); // Индекс начала
  const endIndex = Math.floor((todayDate - endDate) / (1000 * 60 * 60 * 24)); // Индекс конца
  // Проверяем, что индексы в пределах массива
  if (startIndex < 0 || endIndex >= data.length || startIndex < endIndex) {
    throw new Error('Период выходит за пределы массива');
  }
  // Извлекаем данные за указанный период
  if (endIndex === 1) {
    return data.slice(-startIndex + 1);
  }
  return data.slice(-startIndex + 1, -endIndex + 1); // Используем reverse(), чтобы вернуть порядок
};
