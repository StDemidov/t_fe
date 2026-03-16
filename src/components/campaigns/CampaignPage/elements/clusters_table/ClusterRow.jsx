import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { calculateArraySum } from '../../../../../utils/calculations';
import BarplotCampaign from '../BarplotCampaign';
import BarplotCell from '../BarplotCell';
import LineplotCell from '../LineplotCell';
import styles from './style.module.css';
import SwitchActivity from './SwitchActivity';
import React from 'react';

const ClusterRow = ({
  cluster,
  onToggleDisabled,
  onChangeBid,
  totalSpend,
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
      <BarplotCell data={cluster.views} style={styles.clusterViews} />
      <BarplotCell data={cluster.clicks} style={styles.clusterClicks} />
      <BarplotCell data={cluster.orders} style={styles.clusterOrders} />
      <BarplotCell data={cluster.toCart} style={styles.clusterToCarts} />
      <LineplotCell
        data={cluster.ctr}
        style={styles.clusterPosition}
        ctrTotal={cluster.ctrTotal}
      />
      <LineplotCell
        data={cluster.toCartCr}
        style={styles.clusterPosition}
        ctrTotal={cluster.toCartCrTotal}
      />{' '}
      <BarplotCell
        data={cluster.spend}
        style={styles.clusterViews}
        ratio={
          totalSpend !== 0
            ? ((cluster.spend.total / totalSpend) * 100).toFixed(1)
            : 0
        }
      />
      {/* <LineplotCell data={cluster.pos} style={styles.clusterPosition} /> */}
    </div>
  );
};

export default React.memo(ClusterRow);

// // Исправленная функция debounce с методом cancel
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
