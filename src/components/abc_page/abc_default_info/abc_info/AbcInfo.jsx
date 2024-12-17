import styles from './style.module.css';

const AbcInfo = ({ defaultData, setIsEditing }) => {
  return (
    <div className={styles.mainBox}>
      <div className={styles.infoBox}>
        <div className={styles.commonRow}>
          <div className={styles.commonCell}></div>
          <div className={styles.commonCell}>AAA</div>
          <div className={styles.commonCell}>A</div>
          <div className={styles.commonCell}>B</div>
          <div className={styles.commonCell}>BC30</div>
          <div className={styles.commonCell}>BC10</div>
          <div className={styles.commonCell}>C</div>
          <div className={styles.commonCell}>G</div>
        </div>
        <div className={styles.commonRow}>
          <div className={styles.commonCell}>Порог</div>
          <div className={styles.commonCell}>{defaultData?.deb_aaa}</div>
          <div className={styles.commonCell}>{defaultData?.deb_a}</div>
          <div className={styles.commonCell}>{defaultData?.deb_b}</div>
          <div className={styles.commonCell}>{defaultData?.deb_bc30}</div>
          <div className={styles.commonCell}>{defaultData?.deb_bc10}</div>
          <div className={styles.commonCell}>{defaultData?.deb_c}</div>
          <div className={styles.commonCell}>{defaultData?.deb_c}</div>
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

export default AbcInfo;
