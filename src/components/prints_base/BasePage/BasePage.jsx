import { useDispatch, useSelector } from 'react-redux';
import * as XLSX from 'xlsx';
import FiltersUpcomingPage from '../FiltersUpcomingPage/FiltersUpcomingPage';
import ItemCard from './ItemCard';
import styles from './style.module.css';
import {
  createOrders,
  selectUpcomingCategoryFilter,
  selectUpcomingCountryFilter,
  selectUpcomingPatternFilter,
  selectUpcomingSortingType,
  updatePatterns,
} from '../../../redux/slices/basePrints';
import { hostName } from '../../../utils/host';
import { useRef, useState } from 'react';
import JSZip from 'jszip';
import { saveAs } from 'file-saver';

const BasePage = ({ items, sizesStorage, setSizesStorage }) => {
  const categoryFilter = useSelector(selectUpcomingCategoryFilter);
  const patternFilter = useSelector(selectUpcomingPatternFilter);
  const countryFilter = useSelector(selectUpcomingCountryFilter);
  const selectedSorting = useSelector(selectUpcomingSortingType);
  const [draftStorage, setDraftStorage] = useState({});

  const dispatch = useDispatch();
  const fileInputRef = useRef(null);

  const getPatternMap = () => {
    const map = {};

    items.forEach((item) => {
      map[item.vendorcode] = item.pattern_data?.pattern_name;
    });

    return map;
  };

  const exportToExcel = async () => {
    const patternMap = getPatternMap();

    // Группировка по лекалам
    const grouped = {};

    Object.entries(sizesStorage).forEach(([article, barcodes]) => {
      const patternName = patternMap[article] || 'unknown';

      if (!grouped[patternName]) {
        grouped[patternName] = [];
      }

      Object.entries(barcodes).forEach(([barcode, value]) => {
        grouped[patternName].push([barcode, value, '', article]);
      });
    });

    const patternNames = Object.keys(grouped);

    // Если только одно лекало → обычный Excel
    if (patternNames.length === 1) {
      const ws = XLSX.utils.aoa_to_sheet(grouped[patternNames[0]]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      XLSX.writeFile(wb, `${patternNames[0]}.xlsx`);
      return;
    }

    // Если несколько → ZIP
    const zip = new JSZip();

    patternNames.forEach((patternName) => {
      const ws = XLSX.utils.aoa_to_sheet(grouped[patternName]);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');

      const excelBuffer = XLSX.write(wb, {
        bookType: 'xlsx',
        type: 'array',
      });

      zip.file(`${patternName}.xlsx`, excelBuffer);
    });

    const content = await zip.generateAsync({ type: 'blob' });

    saveAs(content, 'patterns_export.zip');
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
    let countryMatch = true;
    if (patternFilter.length) {
      patternMatch = patternFilter.includes(item.pattern_data.pattern_name);
    }
    if (countryFilter.length) {
      countryFilter.forEach((cntry, i) => {
        if (cntry === 'uz') {
          countryMatch = item.vendorcode.toLowerCase().includes('.uz.');
        } else {
          countryMatch = !item.vendorcode.toLowerCase().includes('.uz.');
        }
      });
    }
    return patternMatch && countryMatch;
  });

  const sortedItems = [...filteredItems];
  getSortedData(sortedItems, selectedSorting);
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
          Сохранить {`(${Object.keys(sizesStorage).length})`}
        </button>
      </div>
      {items.length === 0 ? (
        <div>Пусто</div>
      ) : (
        <div className={styles.itemsGrid}>
          {sortedItems.map((item, idx) => (
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
