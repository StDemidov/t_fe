import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import FiltersUpcomingPage from '../FiltersUpcomingPage/FiltersUpcomingPage';
import ItemCard from './ItemCard';
import styles from './style.module.css';
import {
  createOrders,
  selectUpcomingCategoryFilter,
  selectUpcomingPatternFilter,
  selectUpcomingSortingType,
  updatePatterns,
} from '../../../redux/slices/basePrints';
import { hostName } from '../../../utils/host';
import { useRef, useState } from 'react';

const BasePage = ({ items, sizesStorage, setSizesStorage }) => {
  const categoryFilter = useSelector(selectUpcomingCategoryFilter);
  const patternFilter = useSelector(selectUpcomingPatternFilter);
  const selectedSorting = useSelector(selectUpcomingSortingType);
  const [draftStorage, setDraftStorage] = useState({});

  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const exportToExcel = () => {
    // Создаем массив для данных Excel
    const excelData = [];

    // Проходим по каждому артикулу в sizesStorage
    Object.entries(sizesStorage).forEach(([article, barcodes]) => {
      // Проходим по каждому баркоду внутри артикула
      Object.entries(barcodes).forEach(([barcode, value]) => {
        excelData.push([
          barcode, // 1 колонка - баркод
          value, // 2 колонка - значение
          '', // 3 колонка - пустая
          article, // 4 колонка - артикул
        ]);
      });
    });

    // Создаем рабочий лист
    const ws = XLSX.utils.aoa_to_sheet(excelData);

    // Создаем рабочую книгу
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

    // Сохраняем файл
    XLSX.writeFile(wb, 'sizes_export.xlsx');
  };

  const saveOrders = () => {
    const ordersList = Object.entries(sizesStorage).map(
      ([vendor_code, barcodes_data]) => ({
        vendor_code,
        barcodes_data,
      })
    );
    dispatch(
      createOrders({
        data: ordersList,
        url: `${hostName}/prints_base/create_orders`,
      })
    );
    setSizesStorage({});
  };

  // const updatePatterns = () => {
  //   const data = {};
  //   dispatch(
  //     c({
  //       data: data,
  //       url: `${hostName}/prints_base/update_patterns_default_sizes_counts`,
  //     })
  //   );
  //   setSizesStorage({});
  // };

  const handleFileUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });

      // Берем первый лист
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];

      // Преобразуем в JSON
      const rows = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      // Пропускаем заголовок, если он есть (первая строка)
      const dataRows = rows.slice();

      // Создаем объект для хранения данных по лекалам
      const patternsData = {};

      dataRows.forEach((row) => {
        if (row.length >= 3) {
          // Улучшенная очистка строк
          const patternName = String(row[0]).trim();

          // Более тщательная очистка названия размера:
          // 1. Преобразуем в строку
          // 2. Удаляем все пробелы в начале и конце (trim)
          // 3. Удаляем все лишние пробелы внутри (заменяем множественные пробелы на один)
          // 4. Приводим к верхнему регистру
          let sizeName = String(row[1])
            .trim() // Удаляем пробелы в начале и конце
            .replace(/\s+/g, '') // Удаляем ВСЕ пробелы внутри строки
            .toUpperCase(); // Приводим к верхнему регистру

          const value = Number(row[2]);

          if (patternName && sizeName && !isNaN(value)) {
            if (!patternsData[patternName]) {
              patternsData[patternName] = {
                pattern_name: patternName,
                default_sizes_counts: {},
              };
            }

            patternsData[patternName].default_sizes_counts[sizeName] = value;
          }
        }
      });
      // Преобразуем объект в массив
      const patternsArray = Object.values(patternsData);

      dispatch(
        updatePatterns({
          data: patternsArray,
          url: `${hostName}/prints_base/update_patterns_default_sizes_counts`,
        })
      );

      // Очищаем sizesStorage если нужно
      // setSizesStorage({});
    };

    reader.readAsArrayBuffer(file);

    // Сбрасываем значение input, чтобы можно было загрузить тот же файл снова
    event.target.value = '';
  };

  const handleUpdatePatterns = () => {
    // Программно кликаем по скрытому file input
    fileInputRef.current.click();
  };

  const filteredItemsCategory = items.filter((item) => {
    let categoryMatch = true;

    if (categoryFilter.length) {
      categoryMatch = categoryFilter.includes(item.category_name);
    }
    return categoryMatch;
  });
  const filteredItems = filteredItemsCategory.filter((item) => {
    let patternMatch = true;
    if (patternFilter.length) {
      patternMatch = patternFilter.includes(item.pattern_data.pattern_name);
    }
    return patternMatch;
  });

  getSortedData(filteredItems, selectedSorting);
  return (
    <div>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".xlsx, .xls, .csv"
        style={{ display: 'none' }}
      />
      <div className={styles.filtersWButtons}>
        <FiltersUpcomingPage
          items={items}
          filteredItems={filteredItemsCategory}
          count={filteredItems.length}
        />
        <button
          onClick={handleUpdatePatterns}
          className={`${styles.buttonXLSX}`}
        >
          Обновить лекала
        </button>
        <button
          onClick={exportToExcel}
          className={`${
            Object.entries(sizesStorage).length === 0
              ? styles.buttonDisabled
              : styles.buttonXLSX
          }`}
          disabled={Object.entries(sizesStorage).length === 0}
        >
          Экспорт в Excel
        </button>
        <button
          onClick={saveOrders}
          className={`${
            Object.entries(sizesStorage).length === 0
              ? styles.buttonDisabled
              : styles.buttonXLSX
          }`}
          disabled={Object.entries(sizesStorage).length === 0}
        >
          Сохранить
        </button>
      </div>
      {items.length === 0 ? (
        <div>Пусто</div>
      ) : (
        <div className={styles.itemsGrid}>
          {filteredItems.map((item, idx) => (
            <ItemCard
              key={idx}
              item={item}
              draftStorage={draftStorage}
              setDraftStorage={setDraftStorage}
              sizesStorage={sizesStorage}
              setSizesStorage={setSizesStorage}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default BasePage;

const getSortedData = (data, selectedSorting) => {
  switch (selectedSorting) {
    case 'От новых к стырым':
      data.sort((a, b) => (a.created_at > b.created_at ? -1 : 1));
      break;
    case 'От старых к новым':
      data.sort((a, b) => (a.created_at > b.created_at ? 1 : -1));
      break;
    default:
      data.sort((a, b) => (a.created_at > b.created_at ? -1 : 1));
  }
};
