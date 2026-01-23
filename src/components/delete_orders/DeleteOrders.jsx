import { v4 as uuidv4 } from 'uuid';

import { useState } from 'react';
import { useDispatch } from 'react-redux';
import * as XLSX from 'xlsx';
import styles from './style.module.css';

import { createOrder } from '../../redux/slices/barcodeSlice';
import { hostName } from '../../utils/host';

export default function DeleteOrders({ existingOrders }) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const dispatch = useDispatch();
  const [ordersList, setOrdersListt] = useState([]);

  const resetState = () => {
    setIsOpen(false);
    setConfirmOpen(false);
    setOrdersListt([]);
  };

  const handeClickOnOrder = (e) => {
    const order = e.currentTarget.getAttribute('data-value');
    if (ordersList.includes(order)) {
      const newList = ordersList.filter((elem) => {
        return elem !== order;
      });
      setOrdersListt(newList);
    } else {
      setOrdersListt([].concat(ordersList, order));
    }
  };

  const handleDelete = () => {
    setConfirmOpen(true);
  };

  const confirmDelete = () => {
    console.log('Отправка заказа: ', ordersList);
    dispatch(
      createOrder({
        data: ordersList,
        url: `${hostName}/barcode/delete_orders`,
      })
    );
    resetState();
  };

  return (
    <div>
      <button className={styles.actionButton} onClick={() => setIsOpen(true)}>
        Удалить
      </button>
      {isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Удаление заказов</h2>
            <div className={styles.ordersGrid}>
              {existingOrders.map((order) => {
                return (
                  <div
                    key={uuidv4()}
                    className={
                      ordersList.includes(order)
                        ? styles.singleOrderChosen
                        : styles.singleOrder
                    }
                    onClick={handeClickOnOrder}
                    data-value={order}
                  >
                    <div>{order}</div>
                  </div>
                );
              })}
            </div>
            {ordersList.length ? (
              <button
                className={styles.smallActionButton}
                onClick={handleDelete}
              >
                Удалить
              </button>
            ) : (
              <></>
            )}
            <button className={styles.smallActionButton} onClick={resetState}>
              Отмена
            </button>
          </div>
        </div>
      )}
      {confirmOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Подтвердите удаление</h2>
            <button
              className={styles.smallActionButton}
              onClick={confirmDelete}
            >
              Подтвердить
            </button>
            <button
              className={styles.smallActionButton}
              onClick={() => setConfirmOpen(false)}
            >
              Отмена
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
