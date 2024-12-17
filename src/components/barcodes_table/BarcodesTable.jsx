import LazyLoad from 'react-lazyload';
import { v4 as uuidv4 } from 'uuid';
import { useSelector } from 'react-redux';
import { PiEmptyDuotone } from 'react-icons/pi';

import { getSum, getDataForPeriod } from '../../utils/dataSlicing';
import BarplotVC from '../barplot_vc/BarplotVC';
import styles from './style.module.css';
import { selectBarcodeDatesFilter } from '../../redux/slices/filterSlice';

const BarcodesTable = ({ barcodes }) => {
  const datesFilter = useSelector(selectBarcodeDatesFilter);
  const startDate = new Date(datesFilter.start);
  const endDate = new Date(datesFilter.end);
  return (
    <div className={styles.tableWrapper}>
      <div className={styles.table}>
        <div className={styles.tableHeader}>
          <div className={styles.imageCell}>Артикул</div>
          <div className={styles.cell}>Размер</div>
          <div className={styles.cell}>Заказы</div>
          <div className={styles.cell}>Остатки WB</div>
          <div className={styles.cell}>Остаток МС</div>
          <div className={styles.cell}>Обор-сть WB</div>
          <div className={styles.cell}>Обор-сть общая</div>
        </div>
        {Object.keys(barcodes).map((vendorcode) => {
          return (
            <div className={styles.row} key={uuidv4()}>
              <div className={styles.imageCell} key={uuidv4()}>
                <LazyLoad display="none" key={uuidv4()} overflow>
                  {barcodes[vendorcode].vendor_code.image ? (
                    <img
                      src={barcodes[vendorcode].vendor_code.image}
                      className={styles.zoomImage}
                      alt="Фото"
                    />
                  ) : (
                    'Фото'
                  )}
                  {vendorcode}
                </LazyLoad>
              </div>
              <div className={styles.highCell} key={uuidv4()}>
                {Object.keys(barcodes[vendorcode].barcodes).map(
                  (barcode, i) => {
                    return (
                      <div className={styles.cell} key={uuidv4()}>
                        {barcodes[vendorcode].barcodes[barcode].size}
                      </div>
                    );
                  }
                )}
              </div>
              <div className={styles.highCell} key={uuidv4()}>
                {Object.keys(barcodes[vendorcode].barcodes).map(
                  (barcode, i) => {
                    return (
                      <div className={styles.cell} key={uuidv4()}>
                        <LazyLoad
                          key={uuidv4()}
                          offset={100}
                          style={{ textAlign: 'center' }}
                        >
                          <div>
                            <BarplotVC
                              key={uuidv4()}
                              data={barcodes[vendorcode].barcodes[
                                barcode
                              ].wb_orders_daily
                                .split(',')
                                .map(Number)}
                              dates={datesFilter}
                            />
                            <div
                              className={styles.summary}
                              key={uuidv4()}
                              style={
                                getSum(
                                  barcodes[vendorcode].barcodes[
                                    barcode
                                  ].wb_orders_daily
                                    .split(',')
                                    .map(Number),
                                  startDate,
                                  endDate
                                )
                                  ? { display: 'block' }
                                  : { display: 'none' }
                              }
                            >
                              Итого:{' '}
                              {getSum(
                                barcodes[vendorcode].barcodes[
                                  barcode
                                ].wb_orders_daily
                                  .split(',')
                                  .map(Number),
                                startDate,
                                endDate
                              )}
                            </div>
                          </div>
                        </LazyLoad>
                      </div>
                    );
                  }
                )}
              </div>

              <div className={styles.highCell}>
                {Object.keys(barcodes[vendorcode].barcodes).map(
                  (barcode, i) => {
                    return (
                      <div className={styles.cell} key={uuidv4()}>
                        <LazyLoad
                          key={uuidv4()}
                          offset={100}
                          style={{ textAlign: 'center' }}
                        >
                          <BarplotVC
                            key={uuidv4()}
                            data={barcodes[vendorcode].barcodes[
                              barcode
                            ].wb_stocks_daily
                              .split(',')
                              .map(Number)}
                            dates={datesFilter}
                          />
                          <div
                            key={uuidv4()}
                            className={styles.summary}
                            style={
                              getDataForPeriod(
                                barcodes[vendorcode].barcodes[
                                  barcode
                                ].wb_stocks_daily
                                  .split(',')
                                  .map(Number),
                                startDate,
                                endDate
                              ).at(-1)
                                ? { display: 'block' }
                                : { display: 'none' }
                            }
                          >
                            Последние:{' '}
                            {getDataForPeriod(
                              barcodes[vendorcode].barcodes[
                                barcode
                              ].wb_stocks_daily
                                .split(',')
                                .map(Number),
                              startDate,
                              endDate
                            ).at(-1)}
                          </div>
                        </LazyLoad>
                      </div>
                    );
                  }
                )}
              </div>
              <div className={styles.highCell}>
                {Object.keys(barcodes[vendorcode].barcodes).map(
                  (barcode, i) => {
                    return (
                      <div className={styles.cell} key={uuidv4()}>
                        {barcodes[vendorcode].barcodes[barcode]
                          .ms_stocks_last === 0 ? (
                          <PiEmptyDuotone color="red" />
                        ) : (
                          barcodes[vendorcode].barcodes[barcode].ms_stocks_last
                        )}
                      </div>
                    );
                  }
                )}
              </div>
              <div className={styles.highCell}>
                {Object.keys(barcodes[vendorcode].barcodes).map(
                  (barcode, i) => {
                    return (
                      <div className={styles.cell} key={uuidv4()}>
                        {barcodes[vendorcode].barcodes[barcode].turnover_wb ===
                        0 ? (
                          <PiEmptyDuotone color="red" />
                        ) : (
                          barcodes[vendorcode].barcodes[barcode].turnover_wb
                        )}
                      </div>
                    );
                  }
                )}
              </div>
              <div className={styles.highCell} key={uuidv4()}>
                {Object.keys(barcodes[vendorcode].barcodes).map(
                  (barcode, i) => {
                    return (
                      <div className={styles.cell} key={uuidv4()}>
                        {barcodes[vendorcode].barcodes[barcode]
                          .turnover_total === 0 ? (
                          <PiEmptyDuotone color="red" />
                        ) : (
                          barcodes[vendorcode].barcodes[barcode].turnover_total
                        )}
                      </div>
                    );
                  }
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BarcodesTable;
