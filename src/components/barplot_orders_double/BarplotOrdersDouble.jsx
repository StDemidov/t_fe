import { Bar, Line } from 'react-chartjs-2';
import { PiEmptyDuotone } from 'react-icons/pi';
import styles from './style.module.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Tooltip
);

const BarplotOrdersDouble = ({ orders, prices, dates }) => {
  console.log(dates);
  const startDate = new Date(dates.start);
  const endDate = new Date(dates.end);

  let labels = getDateNumberArray(orders);
  console.log(labels);
  const data_orders = getDataForPeriod(orders, startDate, endDate);
  const data_prices = getDataForPeriod(prices, startDate, endDate);

  if (data_orders.reduce((sum, num) => sum + num, 0) === 0) {
    return <PiEmptyDuotone color="red" />;
  }

  labels = getDataForPeriod(labels, startDate, endDate);

  const chartData = {
    labels,
    datasets: [
      {
        type: 'bar',
        label: 'Заказы',
        data: data_orders,
        backgroundColor: 'rgba(130, 84, 255, 0.3)',
        borderColor: 'rgba(130, 84, 255, 1)',
        borderWidth: 0,
        yAxisID: 'y-orders',
      },
      {
        type: 'line',
        label: 'Цена',
        data: data_prices,
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.3)',
        pointRadius: 1,
        borderWidth: 0.8,
        yAxisID: 'y-prices',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
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
      'y-orders': {
        display: false,
        beginAtZero: true,
      },
      'y-prices': {
        display: false,
        beginAtZero: true,
        position: 'right',
      },
    },
  };

  return (
    <div
      className={styles.barDiv}
      style={{ width: '150px', height: '75px', textAlign: 'center' }}
    >
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarplotOrdersDouble;

function getDateNumberArray(dataArray) {
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

function getDataForPeriod(data, startDate, endDate) {
  const todayDate = new Date();
  console.log(todayDate);
  const startIndex = Math.ceil((todayDate - startDate) / (1000 * 60 * 60 * 24));
  const endIndex = Math.floor((todayDate - endDate) / (1000 * 60 * 60 * 24));

  if (startIndex < 0 || endIndex >= data.length || startIndex < endIndex) {
    throw new Error('Период выходит за пределы массива');
  }

  return endIndex === 1
    ? data.slice(-startIndex + 1)
    : data.slice(-startIndex + 1, -endIndex + 1);
}
