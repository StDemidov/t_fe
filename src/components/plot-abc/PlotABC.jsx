import React from 'react';
import { Line } from 'react-chartjs-2';

import { Chart as ChartJS, CategoryScale, LinearScale } from 'chart.js';

ChartJS.register(CategoryScale, LinearScale);

// Регистрация модулей Chart.js

// Соответствие строк и их весов
const weightMap = {
  AAA: 7,
  A: 6,
  B: 5,
  BC30: 4,
  BC10: 3,
  C: 2,
  G: 1,
};

// Инвертируем карту для обратного отображения вес -> строка
const weightToStringMap = Object.fromEntries(
  Object.entries(weightMap).map(([key, value]) => [value, key])
);

const PlotABC = ({ data }) => {
  // Оставляем только 14 последних значений, если их больше
  const limitedData = data.slice(-14);

  // Преобразование строк в веса
  const weights = limitedData.map((item) => weightMap[item] || 0);

  // Генерация дат
  const generateDates = (length) => {
    const dates = [];
    const today = new Date();
    for (let i = 0; i < length; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - (length - i));
      dates.push(date.toLocaleDateString());
    }
    return dates;
  };

  const labels = generateDates(limitedData.length);

  // Данные для графика
  const chartData = {
    labels,
    datasets: [
      {
        label: 'Вес строк',
        data: weights,
        borderColor: 'rgba(75, 192, 192, 1)',
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderWidth: 1,
        pointRadius: 1,
      },
    ],
  };

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
        position: 'top',
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
        callbacks: {
          label: (tooltipItem) => {
            // Получаем значение строки по весу
            const weight = tooltipItem.raw;
            const stringValue = weightToStringMap[weight] || 'Unknown';
            return `${stringValue}`;
          },
        },
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        display: false,
      },
      x: {
        display: false,
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
      <Line data={chartData} options={options} />{' '}
    </div>
  );
};

export default PlotABC;
