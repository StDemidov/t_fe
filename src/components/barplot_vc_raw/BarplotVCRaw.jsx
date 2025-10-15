import { useState } from 'react';
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
} from 'chart.js';
import styles from './style.module.css';

import { getDatesBetween } from '../../utils/dataSlicing';

ChartJS.register(CategoryScale, LinearScale, BarElement);

const BarplotVCRaw = ({
  data,
  raw_data,
  dates,
  need_sum = true,
  last_item = false,
}) => {
  const [showSum, setShowSum] = useState(true);

  let data_full = data.concat(raw_data);
  var labels = getDatesBetween(dates.start, dates.end);

  data_full = { raw_data: raw_data, data: data };

  const dataConcated = data_full.data.concat(data_full.raw_data);

  let total = 0;

  if (last_item) {
    total = dataConcated.slice(-1);
  } else {
    total = dataConcated.reduce((acc, val) => acc + val, 0);
  }

  if (!last_item && total === 0) {
    return <div className={styles.noData}>Нет данных</div>;
  }

  const colors = {
    positive: {
      fill: 'rgba(130, 84, 255, 0.3)',
      border: 'rgba(130, 84, 255, 1)',
      hover: '#816ce8',
    },
    positiveRaw: {
      fill: 'rgba(84, 149, 255, 0.3)',
      border: 'rgb(84, 192, 255)',
      hover: 'rgb(84, 192, 255)',
    },
    negative: {
      fill: 'rgba(255, 84, 84, 0.3)',
      border: 'rgba(255, 84, 84, 1)',
      hover: '#e76c6c',
    },
    negativeRaw: {
      fill: 'rgba(71, 62, 70, 0.3)',
      border: 'rgb(26, 24, 25)',
      hover: 'rgb(26, 24, 25, 0.5)',
    },

    zero: {
      fill: 'rgba(160, 160, 160, 0.3)',
      border: 'rgba(160, 160, 160, 1)',
      hover: '#aaaaaa',
    },
  };
  let backgroundColor = data_full.data.map((val) =>
    val > 0
      ? colors.positive.fill
      : val < 0
      ? colors.negative.fill
      : colors.zero.fill
  );

  if (data_full.raw_data) {
    backgroundColor = backgroundColor.concat(
      data_full.raw_data.map((val) =>
        val > 0
          ? colors.positiveRaw.fill
          : val < 0
          ? colors.negativeRaw.fill
          : colors.zero.fill
      )
    );
  }

  let borderColor = data_full.data.map((val) =>
    val > 0
      ? colors.positive.border
      : val < 0
      ? colors.negative.border
      : colors.zero.border
  );

  if (data_full.raw_data) {
    borderColor = borderColor.concat(
      data_full.raw_data.map((val) =>
        val > 0
          ? colors.positiveRaw.border
          : val < 0
          ? colors.negativeRaw.border
          : colors.zero.border
      )
    );
  }

  let hoverColor = data_full.data.map((val) =>
    val > 0
      ? colors.positive.hover
      : val < 0
      ? colors.negative.hover
      : colors.zero.hover
  );

  if (data_full.raw_data) {
    hoverColor = hoverColor.concat(
      data_full.raw_data.map((val) =>
        val > 0
          ? colors.positiveRaw.hover
          : val < 0
          ? colors.negativeRaw.hover
          : colors.zero.hover
      )
    );
  }

  const chartData = {
    labels,
    datasets: [
      {
        data: dataConcated,
        backgroundColor: backgroundColor,
        borderColor: borderColor,
        hoverBackgroundColor: hoverColor,
        borderWidth: 0,
        borderRadius: 2,
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
        enabled: true,
        yAlign: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        titleFont: { size: 6, weight: 'bold' },
        bodyFont: { size: 9 },
        bodyColor: '#ffffff',
        padding: { top: 4, right: 6, bottom: 4, left: 6 },
        caretSize: 0,
        displayColors: false,
        titleAlign: 'center',
        bodyAlign: 'center',
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

  const sumClassName = total < 0 ? styles.sumNegative : styles.sumPositive;

  return (
    <div
      className={styles.barWrapper}
      onMouseEnter={() => setShowSum(false)}
      onMouseLeave={() => setShowSum(true)}
    >
      {need_sum && (
        <div
          className={`${styles.sumOverlay} ${sumClassName} ${
            showSum ? styles.visible : styles.hidden
          } ${total == 0 ? styles.sumNegative : ''}`}
        >
          {total.toLocaleString()}
        </div>
      )}
      <div
        className={`${styles.chartContainer} ${
          showSum && need_sum ? styles.dimmed : ''
        }`}
      >
        <Bar data={chartData} options={options} />
      </div>
    </div>
  );
};

export default BarplotVCRaw;
