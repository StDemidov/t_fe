import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const SingleVendorCodePlot = ({ vcData, dates }) => {
  const startDate = new Date(dates.start);
  const endDate = new Date(dates.end);

  const data = {
    labels: getDateNumberArray(
      getDataForPeriod(vcData.wbOrdersTotal, startDate, endDate)
    ),
    datasets: [
      {
        label: 'Заказы',
        data: getDataForPeriod(vcData.wbOrdersTotal, startDate, endDate),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: false,
        yAxisID: 'y-axis-1',
        borderWidth: 1.5,
        pointRadius: 2,
      },
      {
        label: 'Остатки WB',
        data: getDataForPeriod(vcData.wbStocksTotal, startDate, endDate),
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.4,
        fill: false,
        yAxisID: 'y-axis-1',
        borderWidth: 1.5,
        pointRadius: 2,
      },
      {
        label: 'Цена до СПП',
        data: getDataForPeriod(vcData.priceBeforeDisc, startDate, endDate),
        borderColor: 'rgba(255, 99, 132, 1)',
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        tension: 0.4,
        fill: false,
        yAxisID: 'y-axis-3',
        borderWidth: 1.5,
        pointRadius: 2,
      },
      {
        label: 'EBITDA/День',
        data: getDataForPeriod(
          vcData.dailyEbitda.concat(vcData.rawDailyEbitda),
          startDate,
          endDate
        ),
        borderColor: 'rgba(39, 39, 245, 0.8)',
        backgroundColor: 'rgba(39, 39, 245, 0.2)',
        tension: 0.4,
        fill: false,
        yAxisID: 'y-axis-4',
        borderWidth: 1.5,
        pointRadius: 2,
      },
      {
        label: 'Выкупы',
        data: getDataForPeriod(
          vcData.sales.concat(vcData.rawSales),
          startDate,
          endDate
        ),
        borderColor: 'rgba(18, 18, 245, 0.8)',
        backgroundColor: 'rgba(18, 18, 245, 0.2)',
        tension: 0.4,
        fill: false,
        yAxisID: 'y-axis-2',
        borderWidth: 1.5,
        pointRadius: 2,
      },
      {
        label: 'EBITDA',
        data: getDataForPeriod(vcData.ebitda, startDate, endDate),
        borderColor: 'rgba(29, 150, 46, 0.8)',
        backgroundColor: 'rgba(29, 150, 46, 0.2)',
        tension: 0.4,
        fill: false,
        yAxisID: 'y-axis-2',
        borderWidth: 1.5,
        pointRadius: 2,
      },
    ],
  };

  const options = {
    plugins: {
      title: {
        display: false,
      },
    },
    scales: {
      'y-axis-1': {
        type: 'linear',
        position: 'left',
        ticks: {
          beginAtZero: true,
        },
      },
      'y-axis-2': {
        type: 'linear',
        position: 'left',
        ticks: {
          beginAtZero: true,
        },
        grid: {
          drawOnChartArea: false, // Скрываем сетку для второй оси
        },
      },
      'y-axis-3': {
        type: 'linear',
        position: 'right',
        ticks: {
          beginAtZero: true,
        },
        grid: {
          drawOnChartArea: false, // Скрываем сетку для второй оси
        },
      },
      'y-axis-4': {
        type: 'linear',
        position: 'right',
        ticks: {
          beginAtZero: true,
        },
        grid: {
          drawOnChartArea: false, // Скрываем сетку для второй оси
        },
      },
    },
  };

  return <Line data={data} options={options} />;
};

export default SingleVendorCodePlot;

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
