import { v4 as uuidv4 } from 'uuid';
import { TbPointFilled } from 'react-icons/tb';
import { TbPoint } from 'react-icons/tb';
import { FaRegFileExcel } from 'react-icons/fa';
import * as XLSX from 'xlsx';

import styles from './style.module.css';

const CampaignsHeader = ({
  columns,
  selectedCamps,
  setSelectedCamps,
  campaigns,
}) => {
  const handleClickOnUnpick = () => {
    if (selectedCamps.length !== 0) {
      setSelectedCamps([]);
    }
  };
  console.log(selectedCamps);

  const handleClickOnPick = () => {
    const newSelected = campaigns.map((camp) => {
      return camp.campId;
    });
    setSelectedCamps([...selectedCamps, ...newSelected]);
  };

  const handleExcelUpload = (event) => {
    const file = event.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const data = new Uint8Array(e.target.result);
      const workbook = XLSX.read(data, { type: 'array' });
      const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
      const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

      // Пропускаем первую строку, если это заголовок
      const campIds = jsonData
        .flat()
        .filter((id) => id !== undefined && id !== null && id !== '')
        .map((id) => String(id)); // преобразуем в Number

      if (campIds.length > 0) {
        setSelectedCamps((prev) => [...new Set([...prev, ...campIds])]);
      }
    };
    reader.readAsArrayBuffer(file);

    // Сбрасываем input, чтобы можно было загрузить тот же файл повторно
    event.target.value = null;
  };

  const headerCellRender = (baseClass, text) => {
    return (
      <div key={uuidv4()} className={`${baseClass} ${styles.headerCell}`}>
        {text !== 'base' ? (
          text
        ) : (
          <div className={styles.pick}>
            <TbPoint onClick={handleClickOnUnpick} />
            <TbPointFilled onClick={handleClickOnPick} />
            <div className={styles.excelUploadContainer}>
              <label htmlFor="excel-upload">
                <FaRegFileExcel style={{ cursor: 'pointer' }} />
              </label>
              <input
                id="excel-upload"
                type="file"
                accept=".xlsx, .xls, .csv"
                onChange={handleExcelUpload}
                style={{ display: 'none' }}
              />
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={styles.tableHeader}>
      {columns.map((col) => {
        if (!col.hidden) {
          return headerCellRender(col.cellStyle, col.label);
        }
      })}
    </div>
  );
};

export default CampaignsHeader;
