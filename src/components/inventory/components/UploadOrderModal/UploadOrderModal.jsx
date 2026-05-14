import React, { useState, useRef, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import * as XLSX from 'xlsx';
import { createInventoryOrder } from '../../redux/inventorySlice';
import { hostName } from '../../../../utils/host';
import { isValidDateFormat } from '../../utils/inventoryHelpers';
import styles from './UploadOrderModal.module.css';

/** Lock body scroll */
const useBodyScrollLock = (locked) => {
  useEffect(() => {
    if (!locked) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [locked]);
};

/** Extract order name from filename: [104 ПРТ] anything.xlsx → "104 ПРТ" */
const extractOrderName = (filename) => {
  const match = filename.match(/\[([^\]]+)\]/);
  return match ? match[1].trim() : null;
};

/** Parse a single xlsx file → { orderName, data: {barcode: qty} } | error string */
const parseXlsxFile = (file) => {
  return new Promise((resolve) => {
    const orderName = extractOrderName(file.name);
    if (!orderName) {
      resolve({ error: `Файл «${file.name}» не содержит названия в квадратных скобках` });
      return;
    }

    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        const wb = XLSX.read(ev.target.result, { type: 'binary' });
        const sheet = wb.Sheets[wb.SheetNames[0]];
        const rows = XLSX.utils.sheet_to_json(sheet);

        if (!rows.length || !('Баркод' in rows[0]) || !('Количество' in rows[0])) {
          resolve({ error: `Файл «${file.name}»: нужны колонки «Баркод» и «Количество»` });
          return;
        }

        const data = {};
        for (const row of rows) {
          const barcode = String(row['Баркод']).trim();
          const rawQty = row['Количество'];
          const qty = Number(rawQty);
          if (!Number.isFinite(qty) || qty <= 0) {
            resolve({ error: `Файл «${file.name}»: некорректное количество для баркода ${barcode}` });
            return;
          }
          if (data[barcode]) {
            resolve({ error: `Файл «${file.name}»: дублирующийся баркод ${barcode}` });
            return;
          }
          data[barcode] = Math.round(qty);
        }

        resolve({ orderName, data, filename: file.name, rowCount: Object.keys(data).length });
      } catch {
        resolve({ error: `Не удалось прочитать файл «${file.name}»` });
      }
    };
    reader.readAsBinaryString(file);
  });
};

const UploadOrderModal = ({ existingOrders }) => {
  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const [isOpen, setIsOpen] = useState(false);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);
  const [parsedOrders, setParsedOrders] = useState([]); // [{orderName, data, filename, rowCount}]
  const [orderDate, setOrderDate] = useState('');
  const [fileError, setFileError] = useState('');
  const [isDragging, setIsDragging] = useState(false);

  useBodyScrollLock(isOpen || isConfirmOpen);

  const reset = () => {
    setIsOpen(false);
    setIsConfirmOpen(false);
    setParsedOrders([]);
    setOrderDate('');
    setFileError('');
    setIsDragging(false);
  };

  const processFiles = async (files) => {
    setFileError('');
    setParsedOrders([]);
    const fileList = Array.from(files).filter(f => f.name.endsWith('.xlsx'));

    if (fileList.length === 0) {
      setFileError('Выберите файлы в формате .xlsx');
      return;
    }

    const results = await Promise.all(fileList.map(parseXlsxFile));

    // Check for any errors — reject ALL if any file is bad
    const firstError = results.find(r => r.error);
    if (firstError) {
      setFileError(firstError.error);
      if (fileInputRef.current) fileInputRef.current.value = '';
      return;
    }

    // Check for duplicate order names
    const names = results.map(r => r.orderName);
    const duplicateInFiles = names.find((n, i) => names.indexOf(n) !== i);
    if (duplicateInFiles) {
      setFileError(`Дублирующееся название заказа в файлах: «${duplicateInFiles}»`);
      return;
    }

    // Check against existing orders
    const conflict = names.find(n => existingOrders.includes(n));
    if (conflict) {
      setFileError(`Заказ «${conflict}» уже существует`);
      return;
    }

    setParsedOrders(results);
  };

  const handleFileChange = (e) => processFiles(e.target.files);

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFiles(e.dataTransfer.files);
  };

  const handleUpload = () => {
    if (!isValidDateFormat(orderDate)) {
      setFileError('Укажите дату в формате ГГГГ-ММ-ДД');
      return;
    }
    setIsConfirmOpen(true);
  };

  const handleConfirm = () => {
    dispatch(createInventoryOrder({
      data: {
        orders: parsedOrders.map(o => ({
          orderName: o.orderName,
          orderDate,
          data: o.data,
        })),
      },
      url: `${hostName}/barcode/create_new_orders_bulk`,
    }));
    reset();
  };

  const totalBarcodes = parsedOrders.reduce((s, o) => s + o.rowCount, 0);

  return (
    <>
      <button className={styles.triggerBtn} onClick={() => setIsOpen(true)}>
        Загрузить заказ
      </button>

      {isOpen && (
        <div className={styles.overlay}>
          <div className={styles.modal}>
            <h2 className={styles.modalTitle}>Загрузка заказов</h2>

            {/* Format hint */}
            <div className={styles.hintBox}>
              <span className={styles.hintIcon}>💡</span>
              <span className={styles.hintText}>
                Название файла должно содержать название заказа в&nbsp;<b>[квадратных скобках]</b>.
                <br />
                Пример: <code>[104 ПРТ] Дозаказ май.xlsx</code>
              </span>
            </div>

            {/* Multi-file drop zone */}
            <div
              className={`${styles.dropZone} ${parsedOrders.length > 0 ? styles.dropZoneSuccess : ''} ${isDragging ? styles.dropZoneDragging : ''}`}
              onClick={() => fileInputRef.current?.click()}
              onDrop={handleDrop}
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
              onDragLeave={() => setIsDragging(false)}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".xlsx"
                multiple
                onChange={handleFileChange}
                className={styles.hiddenInput}
              />
              {parsedOrders.length > 0 ? (
                <>
                  <span className={styles.dropZoneIcon}>✓</span>
                  <span className={styles.dropZoneFilename}>
                    {parsedOrders.length} {parsedOrders.length === 1 ? 'файл' : parsedOrders.length < 5 ? 'файла' : 'файлов'}
                  </span>
                  <span className={styles.dropZoneCount}>{totalBarcodes} баркодов всего</span>
                </>
              ) : (
                <>
                  <span className={styles.dropZoneIcon}>📂</span>
                  <span className={styles.dropZoneText}>Выберите или перетащите файлы</span>
                  <span className={styles.dropZoneHint}>Можно загрузить несколько .xlsx сразу</span>
                </>
              )}
            </div>

            {/* Parsed files list */}
            {parsedOrders.length > 0 && (
              <div className={styles.filesList}>
                {parsedOrders.map((o, i) => (
                  <div key={i} className={styles.fileItem}>
                    <span className={styles.fileOrderName}>«{o.orderName}»</span>
                    <span className={styles.fileRowCount}>{o.rowCount} шт.</span>
                  </div>
                ))}
              </div>
            )}

            {fileError && <span className={styles.err}>{fileError}</span>}

            {/* Common date for all orders */}
            {parsedOrders.length > 0 && (
              <input
                className={styles.textInput}
                placeholder="Плановая дата (ГГГГ-ММ-ДД)"
                value={orderDate}
                onChange={(e) => setOrderDate(e.target.value)}
              />
            )}

            <div className={styles.btnRow}>
              {parsedOrders.length > 0 && (
                <button className={styles.actionBtn} onClick={handleUpload}>
                  Загрузить
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
            <h2 className={styles.modalTitle}>Подтвердите загрузку</h2>
            <p className={styles.confirmText}>
              {parsedOrders.length} заказ(а): {totalBarcodes} баркодов на {orderDate}
            </p>
            <div className={styles.btnRow}>
              <button className={styles.actionBtn} onClick={handleConfirm}>Подтвердить</button>
              <button className={styles.cancelBtn} onClick={() => setIsConfirmOpen(false)}>Отмена</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default UploadOrderModal;
