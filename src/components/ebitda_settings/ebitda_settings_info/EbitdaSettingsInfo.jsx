import styles from './style.module.css';

const EbitdaSettingsInfo = ({ defaultData, setIsEditing }) => {
  return (
    <div className={styles.mainBox}>
      <div className={styles.infoBox}>
        <div className={`${styles.commonRow} ${styles.headerRow}`}>
          <div className={`${styles.firstCell} ${styles.commonCell}`}></div>
          <div className={styles.commonCell}>Комиссия WB</div>
          <div className={styles.commonCell}>% СПП</div>
          <div className={styles.commonCell}>Комиссия WB НДС</div>
          <div className={styles.commonCell}>НДФЛ</div>
          <div className={styles.commonCell}>НДС (ткань)</div>
        </div>
        <div className={styles.commonRow}>
          <div className={`${styles.firstCell} ${styles.commonCell}`}>
            Настройки
          </div>
          <div className={styles.commonCell}>
            {defaultData?.wb_commission} %
          </div>
          <div className={styles.commonCell}>{defaultData?.spp_percent} %</div>
          <div className={styles.commonCell}>
            {defaultData?.wb_commission_nds} %
          </div>
          <div className={styles.commonCell}>{defaultData?.ndfl} %</div>
          <div className={styles.commonCell}>{defaultData?.nds} %</div>
        </div>
      </div>
      <div className={styles.actionsBox}>
        <button
          onClick={() => {
            setIsEditing(true);
          }}
        >
          Изменить
        </button>
      </div>
    </div>
  );
};

export default EbitdaSettingsInfo;
