import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { calculateArraySum } from '../../../../../utils/calculations';
import BarplotCampaign from '../BarplotCampaign';
import BarplotCell from '../BarplotCell';
import LineplotCell from '../LineplotCell';
import styles from './style.module.css';
import SwitchActivity from './SwitchActivity';

const ClusterRow = ({
  cluster,
  onToggleDisabled,
  onChangeBid,
  dates,
  lastUpdateClusters,
  unified = false,
}) => {
  const [localBid, setLocalBid] = useState(
    cluster.bid == -1 ? '' : cluster.bid.toString()
  );

  // Используем useCallback для создания стабильной функции debounce
  const debouncedOnChangeBid = useMemo(
    () =>
      debounce((value) => {
        onChangeBid(value);
      }, 300),
    [onChangeBid]
  );

  const computedData = useMemo(
    () => computeAllData(cluster, lastUpdateClusters, dates),
    [cluster, lastUpdateClusters, dates]
  );

  const handleBidChange = useCallback(
    (e) => {
      const value = e.target.value;

      // Разрешаем только цифры
      const regex = /^[0-9]*$/;
      if (regex.test(value)) {
        setLocalBid(value);

        // Преобразуем в число при отправке (пустая строка = 0)
        const numericValue = value === '' ? 0 : parseInt(value, 10);
        debouncedOnChangeBid(numericValue);
      }
    },
    [debouncedOnChangeBid]
  );

  // Обработчик потери фокуса - форматируем значение
  const handleBlur = useCallback(() => {
    if (localBid === '') {
      setLocalBid('');
    } else {
      // Убираем ведущие нули
      const num = parseInt(localBid, 10);
      if (!isNaN(num)) {
        setLocalBid(num.toString());
      }
    }
  }, [localBid]);

  // Синхронизация с пропсами при их изменении
  useEffect(() => {
    const next = cluster.bid === 0 ? '' : cluster.bid.toString();

    setLocalBid((prev) => {
      return prev !== next ? next : prev;
    });
  }, [cluster.bid]);

  // Очистка дебаунсера при размонтировании
  useEffect(() => {
    return () => {
      debouncedOnChangeBid.cancel?.();
    };
  }, [debouncedOnChangeBid]);

  return (
    <div className={styles.clusterRow}>
      <div className={styles.clusterName}>{cluster.cluster}</div>

      <div className={styles.clusterActivity}>
        <SwitchActivity
          checked={!cluster.disabled}
          onChange={(checked) => onToggleDisabled(!checked)}
        />
      </div>
      {unified ? (
        <></>
      ) : (
        <div className={styles.clusterBid}>
          <input
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            value={localBid}
            onChange={handleBidChange}
            onBlur={handleBlur}
            placeholder="0"
            className={styles.bidInput}
            onFocus={(e) => e.target.select()}
            disabled={cluster.disabled}
          />
        </div>
      )}

      <BarplotCell data={computedData.views} style={styles.clusterViews} />
      <BarplotCell data={computedData.clicks} style={styles.clusterClicks} />
      <BarplotCell data={computedData.orders} style={styles.clusterOrders} />
      <LineplotCell
        data={computedData.ctr}
        style={styles.clusterPosition}
        ctrTotal={computedData.ctrTotal}
      />
      <BarplotCell data={computedData.toCart} style={styles.clusterToCarts} />
      <LineplotCell data={computedData.pos} style={styles.clusterPosition} />
    </div>
  );
};

export default ClusterRow;

function getDataByDates(data, lastUpdateClusters, { startDate, endDate }) {
  const resultData = [];
  const resultDates = [];

  const n = data.length;

  for (let i = 0; i < n; i++) {
    const currentDate = new Date(lastUpdateClusters);
    currentDate.setDate(currentDate.getDate() - (n - i));

    if (currentDate >= startDate && currentDate <= endDate) {
      resultData.push(data[i]);
      resultDates.push(new Date(currentDate));
    }
  }

  return {
    data: resultData,
    dates: resultDates,
  };
}

// Исправленная функция debounce с методом cancel
function debounce(func, wait) {
  let timeout;

  const debounced = function (...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };

  // Добавляем метод cancel
  debounced.cancel = function () {
    clearTimeout(timeout);
  };

  return debounced;
}

function computeAllData(cluster, lastUpdateClusters, dates) {
  const orders = getDataByDates(
    cluster.ordersByDays,
    lastUpdateClusters,
    dates
  );
  const views = getDataByDates(cluster.viewsByDays, lastUpdateClusters, dates);
  const clicks = getDataByDates(
    cluster.clicksByDays,
    lastUpdateClusters,
    dates
  );
  const toCart = getDataByDates(
    cluster.toCartByDays,
    lastUpdateClusters,
    dates
  );

  const ctrCalc = clicks.data.map((clck, index) => {
    const vws = views.data[index];
    if (vws === 0) {
      return 0;
    }
    return ((clck / vws) * 100).toFixed(2);
  });

  const ctr = {
    data: ctrCalc,
    dates: views.dates,
  };

  const viewsTotal = calculateArraySum(views.data);
  const clickTotal = calculateArraySum(clicks.data);
  const ctrTotal =
    viewsTotal === 0 ? 0 : ((clickTotal / viewsTotal) * 100).toFixed(2);
  const pos = getDataByDates(cluster.positionByDays, lastUpdateClusters, dates);

  return {
    orders,
    views,
    clicks,
    toCart,
    ctr,
    pos,
    viewsTotal,
    clickTotal,
    ctrTotal,
  };
}
