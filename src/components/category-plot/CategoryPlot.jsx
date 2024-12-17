import { Line } from 'react-chartjs-2';
import { useRef } from 'react';
import Chart from 'chart.js/auto';
import annotationPlugin from 'chartjs-plugin-annotation';

import getMondayFromWeekNum from '../../utils/getDateByWeekNum';

Chart.register(annotationPlugin);

const PAST_DATE = 'rgba(150, 150, 150, 0.47)';

const CategoryPlot = ({
  graphData,
  label,
  y_text,
  startDate1 = null,
  endDate1 = null,
  startDate2 = null,
  endDate2 = null,
}) => {
  const chartRef = useRef(null);

  const x_ax = graphData.map((elem, i) => {
    return getMondayFromWeekNum(i);
  });
  const y_ax = graphData;

  function getDateWeek() {
    const currentDate = new Date();
    const januaryFirst = new Date(currentDate.getFullYear(), 0, 1);
    const daysToNextMonday =
      januaryFirst.getDay() === 1 ? 0 : (7 - januaryFirst.getDay()) % 7;
    const nextMonday = new Date(
      currentDate.getFullYear(),
      0,
      januaryFirst.getDate() + daysToNextMonday
    );
    return currentDate < nextMonday
      ? 51
      : currentDate > nextMonday
      ? Math.ceil((currentDate - nextMonday) / (24 * 3600 * 1000) / 7 - 1)
      : 0;
  }

  const currWeek = getDateWeek();

  const horizontalLinePlugin = {
    id: 'horizontalLine',
    afterDraw: (chart) => {
      const ctx = chart.ctx;
      const yAxis = chart.scales.y;
      const xAxis = chart.scales.x;
      const y = yAxis.getPixelForValue(1); // Позиция горизонтальной линии (значение на оси Y)

      ctx.save();
      ctx.beginPath();
      ctx.moveTo(xAxis.left, y);
      ctx.lineTo(xAxis.right, y);
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'rgba(109, 7, 176, 0.79)'; // Цвет горизонтальной линии
      ctx.stroke();
      ctx.restore();
    },
  };

  const data = {
    labels: x_ax,
    datasets: [
      {
        label: label,
        data: y_ax,
        fill: false,
        borderColor: (context) => {
          const index = context.dataIndex;
          const value = context.dataset.data[index];
          return value < 1 ? 'rgba(255, 99, 132, 1)' : 'rgba(29, 150, 46, 0.8)';
        },
        borderWidth: 1.5,
        pointRadius: 1.5,
        tension: 0.4,
        segment: {
          borderColor: (context) => {
            const value = context.p0.parsed.y;
            return value < 1
              ? 'rgba(255, 99, 132, 1)'
              : 'rgba(29, 150, 46, 0.8)';
          },
        },
      },
    ],
  };

  // Настройки для графика
  const options = {
    responsive: true,
    plugins: {
      annotation: {
        annotations: {
          currWeekLine: {
            type: 'line',
            scaleID: 'x',
            value: x_ax[currWeek], // положение первой вертикальной линии
            borderColor: 'red',
            borderWidth: 1,
          },
          currWeekLabel1: {
            type: 'label',
            content: [`Текущая неделя`],
            enabled: true,
            xValue: x_ax[currWeek],
            xAdjust: -5,
            yAdjust: -50,
            yValue: 1,
            font: {
              size: 7,
            },
            rotation: -90,
          },
          startLine1: {
            type: 'line',
            scaleID: 'x',
            value: x_ax[startDate1], // положение первой вертикальной линии
            borderColor: currWeek > startDate1 ? PAST_DATE : 'red',
            borderWidth: 1,
          },
          startLabel1: {
            type: 'label',
            content: [`1 рек. дата начала продаж`],
            enabled: true,
            xValue: x_ax[startDate1],
            color: currWeek > startDate1 ? PAST_DATE : 'black',
            xAdjust: -5,
            yAdjust: -50,
            yValue: 1,
            font: {
              size: 7,
            },
            rotation: -90,
          },

          endLine1: {
            type: 'line',
            scaleID: 'x',
            value: x_ax[endDate1], // положение второй вертикальной линии
            borderColor: currWeek > endDate1 ? PAST_DATE : 'blue',
            borderWidth: 1,
            label: {
              content: `X=2`,
              enabled: true,
              position: 'bot',
            },
          },
          endLabel1: {
            type: 'label',
            content: [`1 рек. дата конца продаж`],
            enabled: true,
            xValue: x_ax[endDate1],
            color: currWeek > endDate1 ? PAST_DATE : 'black',
            xAdjust: -5,
            yAdjust: -50,
            yValue: 1,
            font: {
              size: 7,
            },
            rotation: -90,
          },
          startLine2: {
            type: 'line',
            scaleID: 'x',
            value: x_ax[startDate2], // положение первой вертикальной линии
            borderColor: currWeek > startDate2 ? PAST_DATE : 'red',
            borderWidth: 1,
            label: {
              content: `X=1`,
              enabled: true,
              position: 'top',
            },
          },
          startLabel2: {
            type: 'label',
            content: [`2 рек. дата начала продаж`],
            enabled: true,
            xValue: x_ax[startDate2],
            xAdjust: -5,
            yAdjust: -50,
            color: currWeek > startDate2 ? PAST_DATE : 'black',
            yValue: 1,
            font: {
              size: startDate2 === null ? 0 : 7,
            },
            rotation: -90,
          },
          endLine2: {
            type: 'line',
            scaleID: 'x',
            value: x_ax[endDate2], // положение второй вертикальной линии
            borderColor: currWeek > endDate2 ? PAST_DATE : 'blue',
            borderWidth: 1,
            label: {
              content: `X=2`,
              enabled: true,
              position: 'top',
            },
          },
          endLabel2: {
            type: 'label',
            content: [`2 рек. дата конца продаж`],
            enabled: true,
            color: currWeek > endDate2 ? PAST_DATE : 'black',
            xValue: x_ax[endDate2],
            xAdjust: -5,
            yAdjust: -50,
            yValue: 1,
            font: {
              size: endDate2 === null ? 0 : 7,
            },
            rotation: -90,
          },
        },
      },
      legend: {
        display: true,
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      x: {
        title: {
          display: true,
          text: 'Недели',
        },
      },
      y: {
        title: {
          display: true,
          text: y_text,
        },
        afterDataLimits: (axis) => {
          axis.max += 0.3; // Увеличиваем максимум оси Y для пространства под линией
        },
      },
    },
  };

  return (
    <Line
      ref={chartRef}
      data={data}
      options={options}
      plugins={[horizontalLinePlugin]}
    />
  );
};

export default CategoryPlot;
