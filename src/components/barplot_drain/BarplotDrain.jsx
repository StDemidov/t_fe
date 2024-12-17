import { Line } from 'react-chartjs-2';
import { PiEmptyDuotone } from 'react-icons/pi';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';

ChartJS.register(CategoryScale, LinearScale, BarElement);

const BarplotDrain = ({ data, dates }) => {
  var labels = dates.split(',');

  data = data.split(',').map(Number);
  if (data.length === 0) {
    return <PiEmptyDuotone color="red" />;
  }
  const chartData = {
    labels,
    datasets: [
      {
        data: data,
        backgroundColor: 'rgba(130, 84, 255, 0.3)',
        borderColor: 'rgba(130, 84, 255, 1)',
        borderWidth: 1,
        pointRadius: 1,
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
      style={{
        width: '100px',
        height: '50px',
        textAlign: 'center',
      }}
    >
      <Line data={chartData} options={options} />
    </div>
  );
};

export default BarplotDrain;
