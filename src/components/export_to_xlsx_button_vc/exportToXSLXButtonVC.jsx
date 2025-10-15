import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import React from 'react';
import { useSelector } from 'react-redux';
import { selectVCDatesFilter } from '../../redux/slices/filterSlice';
import { getDatesBetween } from '../../utils/dataSlicing';
import { motion } from 'framer-motion';
import { FaFileExcel } from 'react-icons/fa';
import { IoMdDownload } from 'react-icons/io';
import styles from './style.module.css';

const exportVCMetricsToExcel = (vendorCodeMetrics, startDate, endDate) => {
  // Генерируем список дат между start и end
  const dateList = getDatesBetween(startDate, endDate);

  const rows = [];

  vendorCodeMetrics.forEach((item) => {
    const sales = item.sales.concat(item.rawSales);
    const dailyEbitda = item.dailyEbitda.concat(item.rawDailyEbitda);
    const dailyEbitdaWOAds = item.dailyEbitdaWoAds.concat(
      item.dailyEbitdaWoAdsRaw
    );

    // Предполагается, что длина orders и sales соответствует количеству дней
    dateList.forEach((date, idx) => {
      rows.push({
        Артикул: item.vendorCode,
        Дата: date,
        Заказы: item.wbOrdersTotal[idx] ?? 0,
        Выкупы: sales[idx] ?? 0,
        Остатки: item.wbStocksTotal[idx] ?? 0,
        'Оборачиваемость (заказы)': item.turnoverWB,
        'Оборачиваемость (выкупы)': item.turnoverWBBuyout
          ? item.turnoverWBBuyout
          : 0,
        EBITDA: item.ebitda,
        'EBITDA/День': dailyEbitda[idx] ?? 0,
        'EBITDA/День без РК': dailyEbitdaWOAds[idx] ?? 0,
        'Расходы на РК': item.adsCosts[idx] ?? 0,
        CPS: item.cps,
        ROI: item.roi,
        'Проценты выкупа': item.buyoutP,
        'Цена до СПП': item.priceBeforeDisc[idx] ?? 0,
        'Себестоимость с НДС': item.selfPrice,
        'Себестоимость без НДС': item.selfPriceWONds,
        '% Добавления в корзину': item.addToCart[idx] ?? 0,
        '% из корзины в заказ': item.cartToOrder[idx] ?? 0,
        '% из клика в заказ': item.clickToOrder[idx] ?? 0,
      });
    });
  });

  // Создаём worksheet
  const ws = XLSX.utils.json_to_sheet(rows);

  // Создаём workbook
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, 'Данные');

  // Генерация файла
  const wbout = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  saveAs(
    new Blob([wbout], { type: 'application/octet-stream' }),
    `vendor_metrics_${startDate}_${endDate}.xlsx`
  );
};

const ExportToXSLXButtonVC = ({ vendorCodeMetrics }) => {
  const datesFilter = useSelector(selectVCDatesFilter);
  const startDate = new Date(datesFilter.start);
  const endDate = new Date(datesFilter.end);

  return (
    <button
      onClick={() =>
        exportVCMetricsToExcel(vendorCodeMetrics, startDate, endDate)
      }
      className={styles.button}
    >
      <motion.div
        className={styles.iconContainer}
        whileHover="hover"
        initial="initial"
        animate="initial"
      >
        <motion.div
          variants={{
            initial: { y: 0, opacity: 1 },
            hover: { y: 30, opacity: 0 },
          }}
          transition={{ duration: 0.3 }}
          className={styles.icon}
        >
          <FaFileExcel />
        </motion.div>
        <motion.div
          variants={{
            initial: { y: -30, opacity: 0 },
            hover: { y: 0, opacity: 1 },
          }}
          transition={{ duration: 0.3 }}
          className={`${styles.icon} ${styles.iconOverlay}`}
        >
          <IoMdDownload />
        </motion.div>
      </motion.div>
    </button>
  );
};

export default ExportToXSLXButtonVC;
