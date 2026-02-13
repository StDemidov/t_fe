import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import React from 'react';
import { motion } from 'framer-motion';
import { FaFileExcel } from 'react-icons/fa';
import { IoMdDownload } from 'react-icons/io';
import styles from './style.module.css';

const exportCampsMetricsToExcel = (camps) => {
  // Генерируем список дат между start и end

  const rows = [];

  camps.forEach((camp) => {
    // Предполагается, что длина orders и sales соответствует количеству дней
    camp.dates.forEach((date, idx) => {
      rows.push({
        SKU: camp.sku,
        Артикул: camp.skuName,
        Дата: date,
        РК: camp.campId,
        Показы: camp.views[idx],
        Клики: camp.clicks[idx],
        Траты: camp.spend[idx],
        CTR: camp.ctr[idx],
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
  saveAs(new Blob([wbout], { type: 'application/octet-stream' }), `camps.xlsx`);
};

const ButtonXLSX = ({ camps }) => {
  return (
    <button
      onClick={() => exportCampsMetricsToExcel(camps)}
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

export default ButtonXLSX;
