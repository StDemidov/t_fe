import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar, Line } from 'react-chartjs-2';
import styles from './style.module.css';
import { calculateArraySum } from '../../../../utils/calculations';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const LineplotCampaign = ({ data, dates, small = false }) => {
  if (!data?.length || calculateArraySum(data) === 0) return 'Нет данных';

  const chartData = {
    labels: data.map((_, i) => i), // фиктивные labels
    datasets: [
      {
        data,
        backgroundColor: createVerticalGradient,
        borderWidth: 1,
        pointRadius: small ? 1 : 2,
        borderColor: 'rgba(153, 102, 255, 1)',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
    },
    plugins: {
      tooltip: {
        enabled: true,
        yAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: { size: !small ? 10 : 7, weight: 'bold' },
        bodyFont: { size: !small ? 15 : 12 },
        bodyColor: '#ffffff',
        padding: { top: 4, right: 6, bottom: 4, left: 6 },
        caretSize: 0,
        displayColors: false,
        titleAlign: 'center',
        bodyAlign: 'center',
        callbacks: {
          title: (items) => {
            const index = items[0].dataIndex;
            return formatDate(dates[index]);
          },
          label: (item) => `${item.raw}`,
        },
      },
      legend: {
        display: false,
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default LineplotCampaign;

const formatDate = (date) =>
  date.toLocaleDateString('ru-RU', {
    day: '2-digit',
    month: '2-digit',
  });

const createVerticalGradient = (context) => {
  const { chart } = context;
  const { ctx, chartArea } = chart;

  if (!chartArea) return null; // важно для первого рендера

  const gradient = ctx.createLinearGradient(
    0,
    chartArea.bottom,
    0,
    chartArea.top
  );

  gradient.addColorStop(0, 'rgba(85, 37, 134, 1)');
  gradient.addColorStop(0.49, 'rgba(106, 53, 156, 1)');
  gradient.addColorStop(1, 'rgba(128, 79, 179, 1)');

  return gradient;
};
