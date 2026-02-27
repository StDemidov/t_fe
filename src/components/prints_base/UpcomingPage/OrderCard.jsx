import { useEffect, useState } from 'react';

import { RiDeleteBinLine } from 'react-icons/ri';

import styles from './style.module.css';
import { useDispatch } from 'react-redux';
import { deleteOrder } from '../../../redux/slices/basePrints';
import { hostName } from '../../../utils/host';

const OrderCard = ({ item }) => {
  const { image, vendorcode, created_at, orders_data } = item;
  const order = orders_data[0];
  const orders_count = order.sizes_counts_data;

  const dispatch = useDispatch();

  // const defaultCounts = pattern_data?.default_sizes_counts || {};

  // порядок сортировки размеров
  const sizeOrder = [
    'XXS-XS',
    'S-M',
    'L-XL',
    'XS',
    'S',
    'M',
    'L',
    'XL',
    'XXL',
    '4XL',
    'XS/155',
    'S/155',
    'M/155',
    'L/155',
    'XL/155',
    'XXL/155',
    'XS/175',
    'S/175',
    'M/175',
    'L/175',
    'XL/175',
    'XXL/175',
    'XS РОСТ 1',
    'S РОСТ 1',
    'M РОСТ 1',
    'L РОСТ 1',
    'XL РОСТ 1',
    'XXL РОСТ 1',
    'XS РОСТ 2',
    'S РОСТ 2',
    'M РОСТ 2',
    'L РОСТ 2',
    'XL РОСТ 2',
    'XXL РОСТ 2',
  ];

  // только первичная инициализация

  // Функция для сортировки размеров
  const getSortedSizes = () => {
    // Создаем массив объектов { size, barcode }
    const sizesArray = Object.entries(orders_count).map(([size, order]) => ({
      size,
      order,
    }));

    // Сортируем согласно sizeOrder
    return sizesArray.sort((a, b) => {
      const indexA = sizeOrder.indexOf(a.size);
      const indexB = sizeOrder.indexOf(b.size);

      // Если размер не найден в sizeOrder, отправляем его в конец
      if (indexA === -1 && indexB === -1) {
        // Если оба не найдены, сортируем по алфавиту
        return a.size.localeCompare(b.size);
      }
      if (indexA === -1) return 1; // a не найден, должен быть после b
      if (indexB === -1) return -1; // b не найден, должен быть после a

      return indexA - indexB; // сортируем по индексу в sizeOrder
    });
  };

  const handleDelete = () => {
    dispatch(
      deleteOrder({
        data: { vendor_code: vendorcode },
        url: `${hostName}/prints_base/delete_order`,
      })
    );
  };

  return (
    <div className={styles.orderCard}>
      {/* LEFT */}
      <div className={styles.topSide}>
        <div className={styles.meta}>
          <div className={styles.vendor}>{vendorcode}</div>
          <div className={styles.date}>
            <div>Дата появления артикула: {formatDate(created_at)}</div>
            <div>
              Дата создания заказа: {formatDate(order.order_creation_date)}
            </div>
            <div>
              Примерная дата выхода: {addSixWeeks(order.order_creation_date)}
            </div>
          </div>
        </div>
      </div>
      <div className={styles.bottomSide}>
        <div className={styles.left}>
          <img src={image} alt={vendorcode} className={styles.photo} />
        </div>

        {/* RIGHT */}
        <div className={styles.right}>
          <div className={styles.sizes}>
            {getSortedSizes().map(({ size, order }) => (
              <div key={`${vendorcode}-${size}`} className={styles.sizeRow}>
                <label>{size}</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  value={order}
                  onFocus={(e) => e.target.select()}
                  disabled={true}
                />
              </div>
            ))}
          </div>
          <RiDeleteBinLine
            className={styles.deleteButton}
            onClick={handleDelete}
          />
        </div>
      </div>
    </div>
  );
};

export default OrderCard;

function formatDate(dateString) {
  // Создаем объект Date из строки
  const date = new Date(dateString);

  // Проверяем, валидная ли дата
  if (isNaN(date.getTime())) {
    return 'Неверная дата';
  }

  // Получаем день, месяц и год
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0'); // Месяцы начинаются с 0
  const year = date.getFullYear();

  // Возвращаем в формате ДД-ММ-ГГГГ
  return `${day}-${month}-${year}`;
}

function addSixWeeks(dateString) {
  // Создаем объект Date из строки
  const date = new Date(dateString);

  // Проверяем, валидная ли дата
  if (isNaN(date.getTime())) {
    return 'Неверная дата';
  }

  // Прибавляем 6 недель (6 * 7 = 42 дня)
  date.setDate(date.getDate() + 42);

  // Форматируем результат
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}-${month}-${year}`;
}
