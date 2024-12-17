import { Bar } from 'react-chartjs-2';
import { PiEmptyDuotone } from 'react-icons/pi';
import styles from './style.module.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement);

const BarplotVC = ({ data, dates }) => {
  const startDate = new Date(dates.start);
  const endDate = new Date(dates.end);

  var labels = getDateNumberArray(data);

  data = getDataForPeriod(data, startDate, endDate);
  let sum = 0;
  data.forEach((num) => {
    sum += num;
  });
  if (sum === 0) {
    return <PiEmptyDuotone color="red" />;
  }
  labels = getDataForPeriod(labels, startDate, endDate);
  const chartData = {
    labels,
    datasets: [
      {
        data: data,
        backgroundColor: 'rgba(130, 84, 255, 0.3)',
        borderColor: 'rgba(130, 84, 255, 1)',
        borderWidth: 0,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false, // Это позволяет графику растягиваться по ячейке
    plugins: {
      legend: {
        display: false, // Убирает легенду
      },
      title: {
        display: false, // Убирает заголовок
      },
      tooltip: {
        enabled: true, // Оставляем тултипы
        yAlign: 'top', // Тултип появляется сверху курсора
        backgroundColor: 'rgba(0, 0, 0, 0.7)', // Цвет фона тултипа
        titleFont: {
          size: 6, // Размер шрифта заголовка тултипа
          weight: 'bold', // Жирность заголовка тултипа
        },
        bodyFont: {
          size: 8, // Размер шрифта текста тултипа
        },
        padding: {
          top: 4,
          right: 6,
          bottom: 4,
          left: 6,
        },
      },
    },
    scales: {
      x: {
        display: false, // Убирает подписи на оси X
      },
      y: {
        display: false, // Убирает подписи на оси Y
        beginAtZero: true, // Начало отсчета с нуля (оставляем)
      },
    },
  };

  return (
    <div
      className={styles.barDiv}
      style={{
        width: '100px',
        height: '50px',
        textAlign: 'center',
      }}
    >
      <Bar data={chartData} options={options} />
    </div>
  );
};

export default BarplotVC;

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
