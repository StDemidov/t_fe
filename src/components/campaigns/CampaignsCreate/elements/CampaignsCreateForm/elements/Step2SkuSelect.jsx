import { useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import * as XLSX from 'xlsx';

import { setError } from '../../../../../../redux/slices/errorSlice';
import styles from './style.module.css';
import { setNotification } from '../../../../../../redux/slices/notificationSlice';

const Step2SkuSelect = ({
  settings,
  setCurrentStep,
  setSettings,
  existingCampaigns,
  setLastStep,
}) => {
  const dispatch = useDispatch();

  const [fromExcel, setFromExcel] = useState(true);
  const [skuToFind, setSkuToFind] = useState('');
  const [currentSku, setCurrentSku] = useState('');
  const [currentSkuAdded, setCurrentSkuAdded] = useState(false);

  const fileInputRef = useRef(null);

  const goToStep3 = (e) => {
    setCurrentStep(3);
    setLastStep(3);
  };

  const handleSkuToFindChange = (e) => {
    setSkuToFind(e.target.value);
  };

  const handleClickOnAddSku = (e) => {
    setSettings({
      ...settings,
      skuList: [...settings.skuList, currentSku],
    });
    setCurrentSkuAdded(true);
    setLastStep(3);
  };

  const handleClickOnRemoveSku = (e) => {
    const newSkuList = settings.skuList.filter(
      (item) => item.sku !== currentSku.sku
    );

    setSettings({
      ...settings,
      skuList: newSkuList,
    });
    setCurrentSkuAdded(false);
    if (newSkuList.length === 0) {
      setLastStep(2);
    }
  };

  const handleClickOnSearch = (e) => {
    if (skuToFind.length !== 0) {
      const chosenSku = existingCampaigns.filter((item) => {
        let vcNameMatch = false;
        setCurrentSkuAdded(false);
        if (isNaN(skuToFind)) {
          vcNameMatch = item.name.toLowerCase() === skuToFind.toLowerCase();
        } else {
          vcNameMatch = item.sku === skuToFind;
        }
        if (vcNameMatch) {
          return vcNameMatch;
        }
      });
      if (chosenSku[0]) {
        settings.skuList.filter((item) => {
          let skuMatch = false;
          skuMatch = item.sku === chosenSku[0].sku;
          if (skuMatch) {
            setCurrentSkuAdded(true);
          }
        });
        setCurrentSku(chosenSku[0]);
      } else {
        dispatch(setError('Артикул не найден!'));
      }
    } else {
      dispatch(setError('Введите SKU или название артикула!'));
    }
  };

  const handleFileSelect = async (e) => {
    const file = e.target.files[0];

    e.target.value = '';
    if (!file) return;

    // Проверка расширения файла
    if (!file.name.match(/\.(xlsx|xls)$/)) {
      dispatch(setError('Пожалуйста, выберите файл Excel (.xlsx или .xls)'));
      return;
    }

    try {
      // Чтение файла
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data);
      const worksheet = workbook.Sheets[workbook.SheetNames[0]];
      // Конвертация в JSON
      const jsonData = XLSX.utils.sheet_to_json(worksheet, {
        header: 1, // Без заголовков
        defval: '', // Значение по умолчанию для пустых ячеек
      });
      const skuListFromFile = jsonData
        .map((row) => row[0]) // Берем первую колонку
        .filter((value) => value && value.toString().trim() !== '') // Убираем пустые значения
        .map((value) => value.toString().trim()); // Убираем пробелы в начале и конце

      console.log(skuListFromFile);
      if (skuListFromFile.length === 0) {
        dispatch(
          setError(
            'Файл не содержит данных или данные находятся не в первой колонке'
          )
        );
        return;
      }

      const uniqueSkuList = [...new Set(skuListFromFile)];
      // Сопоставление SKU с существующими кампаниями
      const matchedSkus = [];
      const notFoundSkus = [];

      uniqueSkuList.forEach((skuValue) => {
        // Определяем тип значения (число или строка)
        const isNumeric = !isNaN(skuValue) && !isNaN(parseFloat(skuValue));

        // Ищем соответствие в existingCampaigns
        const foundCampaign = existingCampaigns.find((campaign) => {
          if (isNumeric) {
            // Для числовых значений ищем по sku
            return campaign.sku === skuValue;
          } else {
            // Для строковых значений ищем по name (без учета регистра)
            return campaign.name.toLowerCase() === skuValue.toLowerCase();
          }
        });
        if (foundCampaign) {
          matchedSkus.push(foundCampaign);
        } else {
          notFoundSkus.push(skuValue);
        }
      });

      if (matchedSkus.length === 0) {
        dispatch(setError('Ни один артикул из файла не найден'));
        return;
      }

      if (notFoundSkus.length > 0) {
        dispatch(
          setError(
            `Найдено ${matchedSkus.length} артикулов. Не найдено: ${notFoundSkus.length}`
          )
        );
      }

      const currentSkuList = settings.skuList || [];

      // Фильтруем дубликаты (те, которые уже есть в текущем списке)
      const newSkus = matchedSkus.filter(
        (newSku) =>
          !currentSkuList.some((existingSku) => existingSku.sku === newSku.sku)
      );

      if (newSkus.length === 0) {
        dispatch(setError('Все артикулы из файла уже добавлены в список'));
        return;
      }

      // Добавляем новые SKU к существующим
      const updatedSkuList = [...currentSkuList, ...newSkus];

      // Обновляем настройки
      setSettings({
        ...settings,
        skuList: updatedSkuList,
      });

      // Обновляем lastStep если были добавлены элементы
      setLastStep(3);

      // Показываем сообщение об успехе
      dispatch(
        setNotification(`Добавлено ${newSkus.length} новых артикулов из файла`)
      );
    } catch (error) {
      console.error('Ошибка при чтении файла:', error);
      dispatch(setError('Ошибка при чтении файла. Проверьте формат файла.'));
    }
  };

  const handleFileButtonClick = () => {
    fileInputRef.current.click();
  };

  const handleClickOnChangeMethod = () => {
    setFromExcel(!fromExcel);
    setCurrentSku('');
    setCurrentSkuAdded(false);
    setSkuToFind('');
  };

  return (
    <div>
      <fieldset className={styles.skusAddBox}>
        <legend className={styles.legend}>Выберите артикулы</legend>
        <button onClick={handleClickOnChangeMethod} disabled={fromExcel}>
          Из Excel-файла
        </button>
        <button onClick={handleClickOnChangeMethod} disabled={!fromExcel}>
          Вручную
        </button>
        {fromExcel ? (
          <div className={styles.excelSearch}>
            <span>Загрузить список артикулов с помощью XLSX-файла</span>
            <button onClick={handleFileButtonClick}>Выбрать файл</button>
            {/* Скрытый input для выбора файла */}
            <input
              ref={fileInputRef}
              type="file"
              accept=".xlsx,.xls"
              style={{ display: 'none' }}
              onChange={handleFileSelect}
            />
            <div className={styles.fileInfo}>
              {settings.skuList && settings.skuList.length > 0 && (
                <p>Текущее количество артикулов: {settings.skuList.length}</p>
              )}
            </div>
          </div>
        ) : (
          <div className={styles.manualSearch}>
            <span>Выбор вручную</span>
            <input
              value={skuToFind}
              onChange={handleSkuToFindChange}
              type="text"
              placeholder="Введите название артикула или его SKU..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleClickOnSearch();
                }
              }}
            ></input>
            {currentSku === '' ? (
              <div className={styles.chosenSku}>
                Введите название артикула или его SKU в поиске
              </div>
            ) : (
              <div className={styles.chosenSku}>
                <div>
                  <div>{currentSku.sku}</div>
                  {currentSku.manualCampActive >= 0
                    ? 'Есть кампания с ручной ставкой'
                    : currentSku.unifiedCampActive >= 0
                    ? 'Есть кампания с единой ставкой'
                    : 'Не завершенных кампаний нет'}
                </div>

                {currentSkuAdded ? (
                  <button onClick={handleClickOnRemoveSku}>
                    Отменить выбор
                  </button>
                ) : (
                  <button onClick={handleClickOnAddSku}>Добавить</button>
                )}
              </div>
            )}
          </div>
        )}
      </fieldset>
      <button onClick={goToStep3} disabled={settings.skuList.length === 0}>
        Продолжить
      </button>
    </div>
  );
};

export default Step2SkuSelect;
