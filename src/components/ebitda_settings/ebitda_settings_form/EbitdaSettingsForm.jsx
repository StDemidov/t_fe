import { useState } from 'react';
import { useDispatch } from 'react-redux';

import { changeEbitdaSettings } from '../../../redux/slices/ebitdaSettingsSlice';
import styles from './style.module.css';
import { setError } from '../../../redux/slices/errorSlice';
import { hostName } from '../../../utils/host';

const EbitdaSettingsForm = ({ defaultData, setIsEditing }) => {
  const dispatch = useDispatch();

  const [wbCommission, setWbCommision] = useState(defaultData?.wb_commission);
  const [sppPercent, setSppPercent] = useState(defaultData?.spp_percent);
  const [wbCommissionNds, setWbCommissionNds] = useState(
    defaultData?.wb_commission_nds
  );
  const [ndfl, setNdfl] = useState(defaultData?.ndfl);
  const [nds, setNds] = useState(defaultData?.nds);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      wbCommission < 1 ||
      sppPercent < 1 ||
      wbCommissionNds < 1 ||
      ndfl < 1 ||
      nds < 1
    ) {
      dispatch(setError('Все значения должны быть больше 1!'));
    } else {
      const data = {
        wb_commission: wbCommission,
        spp_percent: sppPercent,
        wb_commission_nds: wbCommissionNds,
        ndfl: ndfl,
        nds: nds,
      };
      dispatch(
        changeEbitdaSettings({
          data: data,
          url: `${hostName}/ebitda/`,
        })
      );
    }
  };

  return (
    <div className={styles.mainBox}>
      <form
        id="editEbitdaSettings"
        className={styles.infoBox}
        onSubmit={handleSubmit}
      >
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
          <input
            required={true}
            type="text"
            id=""
            className={styles.commonCell}
            value={
              wbCommission === '' ? defaultData?.wb_commission : wbCommission
            }
            onChange={(e) =>
              setWbCommision(Number(e.target.value.replace(/\D/g, '')))
            }
          />
          <input
            required={true}
            type="text"
            id=""
            className={styles.commonCell}
            value={sppPercent === '' ? defaultData?.spp_percent : sppPercent}
            onChange={(e) =>
              setSppPercent(Number(e.target.value.replace(/\D/g, '')))
            }
          />
          <input
            required={true}
            type="text"
            id=""
            className={styles.commonCell}
            value={
              wbCommissionNds === ''
                ? defaultData?.wb_commission_nds
                : wbCommissionNds
            }
            onChange={(e) =>
              setWbCommissionNds(Number(e.target.value.replace(/\D/g, '')))
            }
          />
          <input
            required={true}
            type="text"
            id=""
            className={styles.commonCell}
            value={ndfl === '' ? defaultData?.ndfl : ndfl}
            onChange={(e) => setNdfl(Number(e.target.value.replace(/\D/g, '')))}
          />
          <input
            required={true}
            type="text"
            id=""
            className={styles.commonCell}
            value={nds === '' ? defaultData?.nds : nds}
            onChange={(e) => setNds(Number(e.target.value.replace(/\D/g, '')))}
          />
        </div>
      </form>
      <div className={styles.actionsBox}>
        <button type="submit" form="editEbitdaSettings">
          Применить
        </button>
        <button
          onClick={() => {
            setIsEditing(false);
          }}
        >
          Отмена
        </button>
      </div>
    </div>
  );
};

export default EbitdaSettingsForm;
