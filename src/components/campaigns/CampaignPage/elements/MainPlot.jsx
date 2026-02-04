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
import { replaceZeros } from '../../../../utils/beaty';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const MainPlot = ({ spend, clicks, views, orders, dates }) => {
  // Добавлен dates пропс
  // Проверяем, что dates существует и имеет правильную длину
  const chartData = {
    labels: dates || spend.map((_, i) => i), // Используем dates если они есть
    datasets: [
      {
        label: 'Траты',
        data: replaceZeros(spend),
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        tension: 0.4,
        fill: true,
        borderWidth: 1.5,
        pointRadius: 2,
        yAxisID: 'y-axis-1',
      },
      {
        label: 'Клики',
        data: replaceZeros(clicks),
        borderColor: 'rgb(180, 49, 180)',
        backgroundColor: 'rgba(157, 9, 120, 0.2)',
        tension: 0.4,
        fill: true,
        borderWidth: 1.5,
        pointRadius: 2,
        yAxisID: 'y-axis-1',
      },
      {
        label: 'Показы',
        data: replaceZeros(views),
        borderColor: 'rgba(153, 102, 255, 1)',
        backgroundColor: 'rgba(153, 102, 255, 0.2)',
        tension: 0.4,
        fill: true,
        borderWidth: 1.5,
        pointRadius: 2,
        yAxisID: 'y-axis-1',
      },
      {
        label: 'Заказы',
        data: replaceZeros(orders),
        borderColor: 'rgb(255, 102, 102)',
        backgroundColor: 'rgba(255, 102, 102, 0.2)',
        tension: 0.4,
        fill: true,
        borderWidth: 1.5,
        pointRadius: 2,
        yAxisID: 'y-axis-1',
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      mode: 'index',
      intersect: false,
    },
    scales: {
      x: {
        display: false,
      },
      y: {
        display: false,
      },
      'y-axis-1': {
        type: 'logarithmic',
        position: 'left',
        display: true,
        ticks: {
          beginAtZero: true,
        },
      },
    },

    plugins: {
      tooltip: {
        enabled: false,
        // Отключаем стандартное позиционирование
        position: 'nearest',
        // Кастомная функция для фиксированного позиционирования
        external: function (context) {
          // tooltipModel доступен как context.tooltip
          const tooltipModel = context.tooltip;

          // Tooltip Element
          let tooltipEl = document.getElementById('chartjs-tooltip');

          // Создаем элемент если его нет
          if (!tooltipEl) {
            tooltipEl = document.createElement('div');
            tooltipEl.id = 'chartjs-tooltip';
            tooltipEl.innerHTML = '<div></div>';
            document.body.appendChild(tooltipEl);
          }

          // Скрываем если нет tooltip
          if (tooltipModel.opacity === 0) {
            tooltipEl.style.opacity = '0';
            return;
          }

          // Устанавливаем текст
          if (tooltipModel.body) {
            const titleLines = tooltipModel.title || [];
            const bodyLines = tooltipModel.body.map((b) => b.lines);

            let innerHtml = '';

            // Title
            if (titleLines.length > 0) {
              innerHtml += `<div class="tooltip-title">${formatDate(
                titleLines[0]
              )}</div>`;
            }

            // Body
            bodyLines.forEach((body, i) => {
              innerHtml += `<div class="tooltip-body">${body}</div>`;
            });

            tooltipEl.innerHTML = innerHtml;
          }

          const chart = context.chart;
          const canvas = chart.canvas;
          const chartArea = chart.chartArea;

          // Фиксированная позиция в левом верхнем углу области графика
          const position = canvas.getBoundingClientRect();
          const left = position.left + window.pageXOffset + chartArea.left;
          const top = position.top + window.pageYOffset + chartArea.top;

          // Применяем стили
          tooltipEl.style.position = 'absolute';
          tooltipEl.style.left = left + 'px';
          tooltipEl.style.top = top + 'px';
          tooltipEl.style.opacity = '1';
          tooltipEl.style.pointerEvents = 'none';
          tooltipEl.style.background = 'rgba(0, 0, 0, 0.7)';
          tooltipEl.style.color = 'white';
          tooltipEl.style.padding = '8px 12px';
          tooltipEl.style.borderRadius = '4px';
          tooltipEl.style.fontSize = '12px';
          tooltipEl.style.zIndex = '1000';
          tooltipEl.style.transition = 'opacity 0.3s';
        },
      },
      legend: {
        display: true,
        position: 'right',
      },
    },
  };

  return <Line data={chartData} options={options} />;
};

export default MainPlot;

const formatDate = (date) => {
  if (!date) return '';

  // Проверяем, является ли date объектом Date
  if (date instanceof Date && !isNaN(date)) {
    return date.toLocaleDateString('ru-RU', {
      day: '2-digit',
      month: '2-digit',
    });
  }

  // Если это строка, пытаемся преобразовать
  try {
    const dateObj = new Date(date);
    if (!isNaN(dateObj)) {
      return dateObj.toLocaleDateString('ru-RU', {
        day: '2-digit',
        month: '2-digit',
      });
    }
  } catch (e) {
    return String(date);
  }

  return String(date);
};
