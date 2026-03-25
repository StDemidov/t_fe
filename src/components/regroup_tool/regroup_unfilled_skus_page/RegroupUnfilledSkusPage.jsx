import { useRef, useState } from 'react';
import * as XLSX from 'xlsx';
import UnfilledItemList from './elements/UnfilledItemList';
import styles from './style.module.css';
import { useDispatch } from 'react-redux';
import {
  fetchAllItems,
  uploadPatterns,
} from '../../../redux/slices/regroupSlice';
import { hostName } from '../../../utils/host';

const RegroupUnfilledSkusPage = ({ allItems, onUpdatePatterns }) => {
  const fileInputRef = useRef(null);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('pattern'); // 'pattern' или 'style'

  // Фильтруем товары в зависимости от выбранного переключателя
  const filteredItems = allItems.filter((item) => {
    if (activeTab === 'pattern') {
      return item.pattern === null;
    } else {
      return item.style === null;
    }
  });

  // Кнопка 1: Выгрузить товары
  const handleExport = () => {
    let exportData;

    if (activeTab === 'pattern') {
      // Для "Не заполнено лекало" - 4 колонки
      exportData = filteredItems.map((item) => ({
        Артикул: item.vendorCode || '',
        SKU: item.sku || '',
        Категория: item.categoryName || '',
        Лекала: '', // Оставляем пустым для заполнения
      }));
    } else {
      // Для "Не заполнен стиль" - 3 колонки (без Лекала)
      exportData = filteredItems.map((item) => ({
        Артикул: item.vendorCode || '',
        SKU: item.sku || '',
        Категория: item.categoryName || '',
      }));
    }

    // Создаем рабочий лист
    const worksheet = XLSX.utils.json_to_sheet(exportData);

    // Настраиваем ширину колонок
    const columnWidths =
      activeTab === 'pattern'
        ? [
            { wch: 20 }, // Артикул
            { wch: 20 }, // SKU
            { wch: 25 }, // Категория
            { wch: 30 }, // Лекала
          ]
        : [
            { wch: 20 }, // Артикул
            { wch: 20 }, // SKU
            { wch: 25 }, // Категория
          ];

    worksheet['!cols'] = columnWidths;

    // Создаем рабочую книгу
    const workbook = XLSX.utils.book_new();
    const sheetName =
      activeTab === 'pattern' ? 'Незаполненные лекала' : 'Незаполненные стили';

    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

    // Сохраняем файл
    const fileName =
      activeTab === 'pattern'
        ? `unfilled_patterns_${new Date().toISOString().split('T')[0]}.xlsx`
        : `unfilled_styles_${new Date().toISOString().split('T')[0]}.xlsx`;

    XLSX.writeFile(workbook, fileName);
  };

  // Кнопка 2: Обработка загруженного файла с лекалами (только для вкладки "Не заполнено лекало")
  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();

    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet);

      // Создаем список объектов {sku, pattern}
      const patternsList = jsonData
        .map((row) => {
          // Получаем значение из колонки "Лекала" (может быть разное написание)
          let patternValue =
            row['Лекала'] || row['Лекало'] || row['pattern'] || '';

          // Очищаем от лишних пробелов
          patternValue = String(patternValue).trim();

          // Получаем SKU из колонки
          const sku = row['SKU'] || row['sku'] || '';

          if (sku && patternValue) {
            return {
              sku: String(sku).trim(),
              pattern: patternValue,
            };
          }
          return null;
        })
        .filter((item) => item !== null);

      dispatch(
        uploadPatterns({
          data: patternsList,
          url: `${hostName}/vendorcode/upload_patterns`,
        })
      );

      // Очищаем input, чтобы можно было загрузить тот же файл снова
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };

    reader.onerror = () => {
      alert('Ошибка при чтении файла');
    };

    reader.readAsArrayBuffer(file);
  };

  // Триггер для открытия диалога выбора файла
  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  return (
    <div>
      {/* Переключатели */}
      <div className={styles.tabsContainer}>
        <button
          className={`${styles.tabButton} ${
            activeTab === 'pattern' ? styles.activeTab : ''
          }`}
          onClick={() => setActiveTab('pattern')}
        >
          Не заполнено лекало{' '}
          {`${activeTab === 'pattern' ? `(${filteredItems.length})` : ''}`}
        </button>
        <button
          className={`${styles.tabButton} ${
            activeTab === 'style' ? styles.activeTab : ''
          }`}
          onClick={() => setActiveTab('style')}
        >
          Не заполнен стиль{' '}
          {`${activeTab === 'style' ? `(${filteredItems.length})` : ''}`}
        </button>
      </div>

      {/* Кнопки действий */}
      <div className={styles.buttonContainer}>
        <button
          onClick={handleExport}
          className={styles.exportButton}
          disabled={filteredItems.length === 0}
        >
          Выгрузить{' '}
          {activeTab === 'pattern'
            ? 'незаполненные лекала'
            : 'незаполненные стили'}{' '}
          ({filteredItems.length})
        </button>

        {/* Кнопка загрузки отображается только для вкладки "Не заполнено лекало" */}
        {activeTab === 'pattern' && (
          <>
            <button onClick={triggerFileUpload} className={styles.uploadButton}>
              Добавить лекала
            </button>

            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx, .xls, .csv"
              onChange={handleFileUpload}
              style={{ display: 'none' }}
            />
          </>
        )}
      </div>

      {/* Информация о количестве */}

      <UnfilledItemList items={filteredItems} />
    </div>
  );
};

export default RegroupUnfilledSkusPage;
