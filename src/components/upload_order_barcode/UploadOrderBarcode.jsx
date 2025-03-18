import { useState } from 'react';
import { useDispatch } from 'react-redux';
import * as XLSX from 'xlsx';
import styles from './style.module.css';

import { createOrder } from '../../redux/slices/barcodeSlice';
import { hostName } from '../../utils/host';

export default function UploadOrderBarcode({ existingOrders }) {
  const [isOpen, setIsOpen] = useState(false);
  const [file, setFile] = useState(null);
  const [orderName, setOrderName] = useState('');
  const [isValidFile, setIsValidFile] = useState(false);
  const [isUniqueName, setIsUniqueName] = useState(true);
  const [data, setData] = useState({});
  const [confirmOpen, setConfirmOpen] = useState(false);
  const dispatch = useDispatch();

  const resetState = () => {
    setFile(null);
    setOrderName('');
    setIsValidFile(false);
    setIsUniqueName(true);
    setData({});
    setIsOpen(false);
    setConfirmOpen(false);
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const binaryStr = event.target.result;
      const workbook = XLSX.read(binaryStr, { type: 'binary' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(sheet);

      if (
        !jsonData.length ||
        !('Баркод' in jsonData[0]) ||
        !('Количество' in jsonData[0])
      ) {
        setIsValidFile(false);
        return;
      }

      const barcodeMap = {};
      for (let row of jsonData) {
        if (barcodeMap[row['Баркод']]) {
          setIsValidFile(false);
          return;
        }
        barcodeMap[row['Баркод']] = row['Количество'];
      }

      setData(barcodeMap);
      setIsValidFile(true);
      setFile(selectedFile);
    };
    reader.readAsBinaryString(selectedFile);
  };

  const handleOrderNameChange = (e) => {
    setOrderName(e.target.value);
    setIsUniqueName(!existingOrders.includes(e.target.value));
  };

  const handleUpload = () => {
    setConfirmOpen(true);
  };

  const confirmUpload = () => {
    const order = {
      orderName,
      data,
    };
    dispatch(
      createOrder({
        data: order,
        url: `${hostName}/barcode/create_new_order`,
      })
    );
    resetState();
  };

  return (
    <div>
      <button className={styles.actionButton} onClick={() => setIsOpen(true)}>
        Загрузить заказ
      </button>
      {isOpen && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h2>Загрузка заказа</h2>
            <input type="file" accept=".xlsx" onChange={handleFileChange} />
            {isValidFile && <span>✅ Файл корректен</span>}
            {isValidFile && (
              <input
                className={styles.orderNameInput}
                placeholder="Название заказа"
                value={orderName}
                onChange={handleOrderNameChange}
              />
            )}
            {!isUniqueName && <span>❌ Название уже занято</span>}
            {isValidFile && isUniqueName && (
              <button
                className={styles.smallActionButton}
                onClick={handleUpload}
              >
                Загрузить заказ
              </button>
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
            <h2>Подтвердите загрузку</h2>
            <button
              className={styles.smallActionButton}
              onClick={confirmUpload}
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
