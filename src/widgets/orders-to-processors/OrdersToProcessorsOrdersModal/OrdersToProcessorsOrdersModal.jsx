import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaFileExcel, FaTimes, FaTrash } from 'react-icons/fa';
import { useDispatch } from 'react-redux';
import * as XLSX from 'xlsx';

import {
  createOrdersToProcessors,
  deleteOrdersToProcessors,
  fetchOrdersToProcessorsOrders,
} from '../../../entities/orders-to-processors';
import { DateRangePicker } from '../../../shared/ui';
import { setError } from '../../../redux/slices/errorSlice';
import { setNotification } from '../../../redux/slices/notificationSlice';
import styles from './OrdersToProcessorsOrdersModal.module.css';

const normalizeName = (value) =>
  String(value || '')
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();

const getToday = () => {
  const date = new Date();
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(
    date.getDate()
  ).padStart(2, '0')}`;
};

const normalizeHeader = (value) =>
  String(value || '')
    .trim()
    .toLowerCase()
    .replace(/ё/g, 'е');

const normalizeVendorCode = (value) => String(value || '').trim().toLowerCase();

const parseOrderNameFromFileName = (fileName) => {
  const match = String(fileName || '').match(/^\s*\[([^\]]+)\]/);
  if (!match) {
    throw new Error(
      'Название файла должно начинаться с названия заказа в квадратных скобках: [ШМТ 1] заказ.xlsx'
    );
  }
  const name = normalizeName(match[1]);
  if (!name) throw new Error('Не удалось определить название заказа из файла');
  return name;
};

const parseExcel = async (file, predictorItems) => {
  const workbook = XLSX.read(await file.arrayBuffer(), { type: 'array' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' });
  if (rows.length < 2) throw new Error('Файл не содержит строк с данными');

  const headers = rows[0].map(normalizeHeader);
  const vendorCodeIndex = headers.findIndex(
    (value) => value === 'артикул' || value === 'vendorcode' || value === 'vendor code'
  );
  const sizeIndex = headers.findIndex(
    (value) => value === 'размер' || value === 'size'
  );
  const quantityIndex = headers.findIndex(
    (value) => value === 'количество' || value === 'quantity'
  );
  if (vendorCodeIndex === -1 || sizeIndex === -1 || quantityIndex === -1) {
    throw new Error('Нужны колонки: Артикул, Размер, Количество');
  }

  const duplicateRows = new Set();
  const data = rows.slice(1).map((row, index) => {
    const vendorCode = String(row[vendorCodeIndex] || '').trim();
    const size = String(row[sizeIndex] || '').trim();
    const quantity = Number(row[quantityIndex]);
    const matchedItem = predictorItems.find(
      (item) => normalizeVendorCode(item.vendorCode) === normalizeVendorCode(vendorCode)
    );
    const sku = Number(matchedItem?.sku);
    const key = `${normalizeVendorCode(vendorCode)}::${size.toUpperCase()}`;
    if (!vendorCode) throw new Error(`Строка ${index + 2}: не указан артикул`);
    if (!matchedItem || !Number.isInteger(sku) || sku <= 0) {
      throw new Error(`Строка ${index + 2}: артикул не найден среди данных прогнозов`);
    }
    if (!size) throw new Error(`Строка ${index + 2}: не указан размер`);
    if (!Number.isInteger(quantity) || quantity <= 0) {
      throw new Error(`Строка ${index + 2}: количество должно быть целым числом больше нуля`);
    }
    if (duplicateRows.has(key)) {
      throw new Error(`Строка ${index + 2}: повторяется связка SKU и размера`);
    }
    duplicateRows.add(key);
    return { sku, size, quantity };
  });

  return data;
};

const downloadTemplate = () => {
  const worksheet = XLSX.utils.aoa_to_sheet([
    ['Артикул', 'Размер', 'Количество'],
  ]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Заказ');
  XLSX.writeFile(workbook, '[Название заказа] шаблон.xlsx');
};

const OrdersToProcessorsOrdersModal = ({
  open,
  onClose,
  onChanged,
  predictorItems = [],
}) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);
  const [orders, setOrders] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [ordersSearch, setOrdersSearch] = useState('');
  const [name, setName] = useState('');
  const [plannedCompletionDate, setPlannedCompletionDate] = useState('');
  const [rows, setRows] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState('');
  const today = getToday();
  const filteredOrders = orders.filter((order) =>
    normalizeName(order.name).includes(normalizeName(ordersSearch))
  );
  const sortedOrders = [...filteredOrders].sort((left, right) => {
    const leftDate = left.plannedCompletionDate || '9999-12-31';
    const rightDate = right.plannedCompletionDate || '9999-12-31';
    return String(leftDate).localeCompare(String(rightDate));
  });

  const loadOrders = async () => {
    setOrdersLoading(true);
    try {
      const data = await fetchOrdersToProcessorsOrders();
      setOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      setMessage(error?.message || 'Не удалось загрузить список заказов');
    } finally {
      setOrdersLoading(false);
    }
  };

  useEffect(() => {
    if (!open) return;
    setMessage('');
    setSelectedIds([]);
    loadOrders();
  }, [open]);

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'Escape' && !saving && !deleting) onClose();
    };
    if (open) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [deleting, onClose, open, saving]);

  const handleFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    try {
      setName(parseOrderNameFromFileName(file.name));
      setRows(await parseExcel(file, predictorItems));
      setMessage('');
    } catch (error) {
      setName('');
      setRows([]);
      setMessage(error.message || 'Не удалось прочитать Excel-файл');
    }
  };

  const handleCreate = async () => {
    const normalizedName = normalizeName(name);
    if (!normalizedName) return setMessage('Укажите название заказа');
    if (!plannedCompletionDate) return setMessage('Укажите дату завершения');
    if (rows.length === 0) return setMessage('Загрузите Excel-файл');

    const duplicate = orders.some(
      (order) => normalizeName(order.name) === normalizedName
    );
    if (duplicate) return setMessage('Заказ с таким названием уже существует');

    setSaving(true);
    setMessage('');
    try {
      await createOrdersToProcessors([
        {
          name: normalizedName,
          plannedCompletionDate,
          data: rows,
        },
      ]);
      dispatch(setNotification('Заказ успешно создан'));
      setName('');
      setPlannedCompletionDate('');
      setRows([]);
      await loadOrders();
      onChanged?.();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        'Не удалось создать заказ';
      setMessage(errorMessage);
      dispatch(setError(errorMessage));
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (selectedIds.length === 0) return;
    setDeleting(true);
    setMessage('');
    try {
      await deleteOrdersToProcessors(selectedIds);
      dispatch(setNotification('Заказы успешно удалены'));
      setSelectedIds([]);
      await loadOrders();
      onChanged?.();
    } catch (error) {
      const errorMessage =
        error?.response?.data?.detail ||
        error?.message ||
        'Не удалось удалить заказы';
      setMessage(errorMessage);
      dispatch(setError(errorMessage));
    } finally {
      setDeleting(false);
    }
  };

  if (!open) return null;

  return createPortal(
    <div className={styles.overlay} onClick={() => !saving && !deleting && onClose()}>
      <div
        className={styles.modal}
        role="dialog"
        aria-modal="true"
        aria-label="Заказы переработчикам"
        onClick={(event) => event.stopPropagation()}
      >
        <header className={styles.header}>
          <div>
            <h2>Заказы переработчикам</h2>
            <p>Создание и удаление заказов</p>
          </div>
          <button type="button" className={styles.closeButton} onClick={onClose}>
            <FaTimes />
          </button>
        </header>

        <div className={styles.content}>
          <section className={styles.section}>
            <h3>Создать заказ</h3>
            <p className={styles.instruction}>
              Название заказа берётся из имени файла в формате{' '}
              <b>[Название заказа] файл.xlsx</b>. Первый лист должен содержать
              колонки: <b>Артикул</b>, <b>Размер</b>, <b>Количество</b>.{' '}
              <button
                type="button"
                className={styles.templateLink}
                onClick={downloadTemplate}
              >
                (Шаблон)
              </button>{' '}
              Повторяющиеся пары SKU и размера запрещены.
            </p>
            <div className={styles.fields}>
              <label>
                <span>Название из файла</span>
                <input value={name} readOnly placeholder="Файл ещё не выбран" />
              </label>
              <label>
                <span>Плановая дата завершения</span>
                <div className={styles.dateInputRow}>
                  <input value={plannedCompletionDate} readOnly placeholder="ГГГГ-ММ-ДД" />
                  <DateRangePicker
                    value={{
                      startDate: plannedCompletionDate,
                      endDate: plannedCompletionDate,
                    }}
                    single
                    iconOnly
                    onChange={({ endDate }) => setPlannedCompletionDate(endDate)}
                  />
                </div>
              </label>
            </div>
            <div className={styles.fileRow}>
              <button
                type="button"
                className={styles.secondaryButton}
                onClick={() => fileInputRef.current?.click()}
              >
                <FaFileExcel /> Загрузить Excel
              </button>
              <span>{rows.length ? `Строк загружено: ${rows.length}` : 'Файл не выбран'}</span>
              <input
                ref={fileInputRef}
                className={styles.hiddenInput}
                type="file"
                accept=".xlsx,.xls"
                onChange={handleFile}
              />
            </div>
            <button
              type="button"
              className={styles.primaryButton}
              disabled={saving}
              onClick={handleCreate}
            >
              {saving ? 'Создание...' : 'Создать заказ'}
            </button>
          </section>

          <section className={styles.section}>
            <div className={styles.sectionHeading}>
              <h3>Существующие заказы</h3>
              <button
                type="button"
                className={styles.deleteButton}
                disabled={deleting || selectedIds.length === 0}
                onClick={handleDelete}
              >
                <FaTrash /> Удалить выбранные
              </button>
            </div>
            <input
              className={styles.ordersSearch}
              type="search"
              value={ordersSearch}
              placeholder="Поиск по названию заказа"
              onChange={(event) => setOrdersSearch(event.target.value)}
            />
            {ordersLoading ? (
              <p className={styles.muted}>Загрузка заказов...</p>
            ) : orders.length === 0 ? (
              <p className={styles.muted}>Заказов нет</p>
            ) : (
              <div className={styles.ordersList}>
                {sortedOrders.map((order) => (
                  <label
                    key={order.id}
                    className={`${styles.orderRow} ${
                      order.plannedCompletionDate &&
                      String(order.plannedCompletionDate) < today
                        ? styles.orderRowOverdue
                        : ''
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedIds.includes(order.id)}
                      onChange={() =>
                        setSelectedIds((current) =>
                          current.includes(order.id)
                            ? current.filter((id) => id !== order.id)
                            : [...current, order.id]
                        )
                      }
                    />
                    <span>{normalizeName(order.name)}</span>
                    <small>
                      {order.plannedCompletionDate || 'Дата не указана'}
                    </small>
                  </label>
                ))}
              </div>
            )}
          </section>

          {message && <div className={styles.error}>{message}</div>}
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.cancelButton} onClick={onClose}>
            Закрыть
          </button>
        </footer>
      </div>
    </div>,
    document.body
  );
};

export default OrdersToProcessorsOrdersModal;
