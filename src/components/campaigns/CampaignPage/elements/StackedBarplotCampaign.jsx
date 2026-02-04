import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import styles from './style.module.css';
import { formatDate } from '../../../../utils/beaty';
import { calculateArraySum } from '../../../../utils/calculations';

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

const StackedBarplotCampaign = ({ totalData, associatedData, dates }) => {
  if (
    !totalData?.length ||
    !associatedData?.length ||
    calculateArraySum(totalData) === 0
  )
    return 'Нет данных';

  const directData = totalData.map((total, i) => total - associatedData[i]);

  const chartData = {
    labels: totalData.map((_, i) => i),
    datasets: [
      {
        label: 'Ассоциированные',
        data: associatedData,
        backgroundColor: createAssociatedGradient,
        hoverBackgroundColor: createAssociatedGradientHover,
        borderRadius: 6,
        stack: 'orders',
      },
      {
        label: 'Прямые',
        data: directData,
        backgroundColor: createDirectGradient,
        hoverBackgroundColor: createDirectGradientHover,
        borderRadius: 6,
        stack: 'orders',
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
        titleFont: { size: 10, weight: 'bold' },
        bodyFont: { size: 10 },
        footerFont: { size: 10 },
        bodyColor: '#ffffff',
        padding: { top: 4, right: 6, bottom: 4, left: 6 },
        caretSize: 8,
        displayColors: false,
        titleAlign: 'center',
        bodyAlign: 'center',
        footerAlign: 'center',
        callbacks: {
          title: (items) => {
            const index = items[0].dataIndex;
            return formatDate(dates[index]);
          },
          label: (item) => {
            const value = item.raw;
            if (item.dataset.label === 'Ассоциированные') {
              return `Ассоц.: ${value}`;
            }
            return `Прямые: ${value} `;
          },
          footer: (items) => {
            const index = items[0].dataIndex;
            return `Всего: ${totalData[index]}`;
          },
        },
      },
      legend: {
        display: false,
      },
    },
  };

  return <Bar data={chartData} options={options} />;
};

export default StackedBarplotCampaign;

const createAssociatedGradient = (context) => {
  const { ctx, chartArea } = context.chart;
  if (!chartArea) return null;

  const gradient = ctx.createLinearGradient(
    0,
    chartArea.bottom,
    0,
    chartArea.top
  );

  gradient.addColorStop(0, 'rgba(255, 138, 101, 0.6)');
  gradient.addColorStop(1, 'rgba(255, 112, 67, 0.6)');

  return gradient;
};

const createDirectGradient = (context) => {
  const { ctx, chartArea } = context.chart;
  if (!chartArea) return null;

  const gradient = ctx.createLinearGradient(
    0,
    chartArea.bottom,
    0,
    chartArea.top
  );

  gradient.addColorStop(0, 'rgba(94, 53, 177, 0.6)');
  gradient.addColorStop(1, 'rgba(126, 87, 194, 0.6)');

  return gradient;
};

const createAssociatedGradientHover = (context) => {
  const { ctx, chartArea } = context.chart;
  if (!chartArea) return null;

  const gradient = ctx.createLinearGradient(
    0,
    chartArea.bottom,
    0,
    chartArea.top
  );

  gradient.addColorStop(0, 'rgba(255, 138, 101, 1)');
  gradient.addColorStop(1, 'rgba(255, 112, 67, 1)');

  return gradient;
};

const createDirectGradientHover = (context) => {
  const { ctx, chartArea } = context.chart;
  if (!chartArea) return null;

  const gradient = ctx.createLinearGradient(
    0,
    chartArea.bottom,
    0,
    chartArea.top
  );

  gradient.addColorStop(0, 'rgba(94, 53, 177, 1)');
  gradient.addColorStop(1, 'rgba(126, 87, 194, 1)');

  return gradient;
};
