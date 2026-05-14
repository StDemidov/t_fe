import React, { useState, useMemo, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { deleteInventoryOrders } from '../../redux/inventorySlice';
import { hostName } from '../../../../utils/host';
import styles from '../UploadOrderModal/UploadOrderModal.module.css';

/** Lock/unlock body scroll when modal is open */
const useBodyScrollLock = (locked) => {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [locked]);
};

const DeleteOrderModal = ({ existingOrders, ordersWithDates = [] }) => {
  const dispatch = useDispatch();
  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [selectedOrders, setSelectedOrders] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Lock body scroll whenever any modal is open
  useBodyScrollLock(isOpen || isConfirmOpen);

  const reset = () => {
    setIsOpen(false);
    setIsConfirmOpen(false);
    setSelectedOrders([]);
    setSearchQuery('');
  };

  const toggleOrder = (name) => {
    setSelectedOrders((prev) =>
      prev.includes(name) ? prev.filter((o) => o !== name) : [...prev, name]
    );
  };

  const handleConfirm = () => {
    dispatch(deleteInventoryOrders({
      data: selectedOrders,
      url: `${hostName}/barcode/delete_orders`,
    }));
    reset();
  };

  const now = new Date();

  const { expiredOrders, activeOrders } = useMemo(() => {
    const dateMap = Object.fromEntries(ordersWithDates.map(o => [o.name, o.date]));
    const expired = [], active = [];
    existingOrders.forEach(name => {
      const d = dateMap[name];
      if (d && new Date(d) < now) expired.push(name);
      else active.push(name);
    });
    return { expiredOrders: expired, activeOrders: active };
  }, [existingOrders, ordersWithDates]);

  const filterList = (list) => {
    if (!searchQuery.trim()) return list;
    const q = searchQuery.toLowerCase();
    return list.filter(n => n.toLowerCase().includes(q));
  };

  const filteredExpired = filterList(expiredOrders);
  const filteredActive = filterList(activeOrders);
  const hasResults = filteredExpired.length > 0 || filteredActive.length > 0;

  const Chip = ({ name, expired }) => {
    const isSelected = selectedOrders.includes(name);
    let cls = styles.orderChip;
    if (expired && isSelected) cls = `${styles.orderChip} ${styles.orderChipExpiredSelected}`;
    else if (expired) cls = `${styles.orderChip} ${styles.orderChipExpired}`;
    else if (isSelected) cls = `${styles.orderChip} ${styles.orderChipSelected}`;
    return <div className={cls} onClick={() => toggleOrder(name)}>{name}</div>;
  };

  return (
    <>
      <button className={styles.triggerBtn} onClick={() => setIsOpen(true)}>
        Удалить
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          {/* Fixed-size modal — never resizes */}
          <div className={styles.modalDelete}>
            <h2 className={styles.modalTitle} style={{ alignSelf: 'flex-start' }}>
              Удаление заказов
            </h2>

            {/* Search */}
            <input
              type="text"
              className={styles.searchInput}
              placeholder="Поиск по названию..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              autoFocus
            />

            {/* Scrollable orders area — fixed flex:1, scroll inside */}
            <div style={{ flex: 1, width: '100%', overflowY: 'scroll', overscrollBehavior: 'contain', minHeight: 0, position: 'relative' }}>
              {!hasResults && (
                <div style={{ color: '#9CA3AF', fontSize: 13, textAlign: 'center', paddingTop: 24 }}>
                  Ничего не найдено
                </div>
              )}

              {filteredExpired.length > 0 && (
                <>
                  <div className={`${styles.sectionLabel} ${styles.sectionLabelExpired}`}
                    style={{ marginBottom: 7 }}>
                    🕐 Истекший дедлайн ({filteredExpired.length})
                  </div>
                  <div className={styles.ordersGrid} style={{ marginBottom: 12 }}>
                    {filteredExpired.map(name => <Chip key={name} name={name} expired />)}
                  </div>
                </>
              )}

              {filteredActive.length > 0 && (
                <>
                  {filteredExpired.length > 0 && (
                    <div className={styles.sectionLabel} style={{ marginBottom: 7 }}>
                      Активные
                    </div>
                  )}
                  <div className={styles.ordersGrid}>
                    {filteredActive.map(name => <Chip key={name} name={name} />)}
                  </div>
                </>
              )}
            </div>

            {/* Footer — always at bottom */}
            <div className={styles.btnRow} style={{ flexShrink: 0, borderTop: '1px solid #F3F4F6', paddingTop: 12, width: '100%', marginTop: 0 }}>
              {selectedOrders.length > 0 && (
                <button
                  className={styles.actionBtn}
                  onClick={() => setIsConfirmOpen(true)}
                  style={{ background: '#EF4444' }}
                >
                  Удалить ({selectedOrders.length})
                </button>
              )}
              <button className={styles.cancelBtn} onClick={reset}>Отмена</button>
            </div>
          </div>
        </div>
      )}

      {isConfirmOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Подтвердите удаление</h2>
            <p className={styles.confirmText}>
              Будут удалены {selectedOrders.length} заказ(а/ов)
            </p>
            <div className={styles.btnRow}>
              <button className={styles.actionBtn} onClick={handleConfirm}
                style={{ background: '#EF4444' }}>
                Подтвердить
              </button>
              <button className={styles.cancelBtn} onClick={() => setIsConfirmOpen(false)}>
                Отмена
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default DeleteOrderModal;
