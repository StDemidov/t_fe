import LazyLoad from 'react-lazyload';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PiEmptyDuotone } from 'react-icons/pi';
import { IoSettings } from 'react-icons/io5';
import { v4 as uuidv4 } from 'uuid';

import {
  selectTaskSingle,
  fetchTaskB28ById,
} from '../../../../../redux/slices/tasksB28Slice';

import styles from './style.module.css';
import { hostName } from '../../../../../utils/host';

const SingleTaskB28Info = () => {
  const navigation = useNavigate();
  const dispatch = useDispatch();
  const taskData = useSelector(selectTaskSingle);
  let { id } = useParams();

  const handleClickOnArt = (event) => {
    const vc_id = event.currentTarget.getAttribute('data-value');
    navigation(`/vendorcodes/${vc_id}`);
  };

  const handleClickOnEdit = () => {
    navigation(`/tools/tasks_b_28/edit/${id}`);
  };

  useEffect(() => {
    dispatch(fetchTaskB28ById(`${hostName}/tasksb28/${id}`));
  }, [dispatch]);
  return taskData?.task?.id == id ? (
    <section>
      <h1>{taskData?.task?.task_name} </h1>
      <div className={styles.taskInfo}>
        <div className={styles.infoBlock}>
          <div className={`${styles.abcCatBlock} ${getStyle('AAA')}`}>AAA</div>
          Цена {taskData?.task?.price_aaa} ₽ / EBITDA {taskData?.task?.deb_aaa}{' '}
          ₽
        </div>
        <div className={styles.infoBlock}>
          <div className={`${styles.abcCatBlock} ${getStyle('A')}`}>A</div>
          Цена {taskData?.task?.price_a} ₽ / EBITDA {taskData?.task?.deb_a} ₽
        </div>
        <div className={styles.infoBlock}>
          <div className={`${styles.abcCatBlock} ${getStyle('B')}`}>B</div>
          Цена {taskData?.task?.price_b} ₽ / EBITDA {taskData?.task?.deb_b} ₽
        </div>
        <div className={styles.infoBlock}>
          <div className={`${styles.abcCatBlock} ${getStyle('BC30')}`}>
            BC30
          </div>
          Цена {taskData?.task?.price_bc30} ₽ / EBITDA{' '}
          {taskData?.task?.deb_bc30} ₽
        </div>
        <div className={styles.infoBlock}>
          <div className={`${styles.abcCatBlock} ${getStyle('BC10')}`}>
            BC10
          </div>
          Цена {taskData?.task?.price_bc10} ₽ / EBITDA{' '}
          {taskData?.task?.deb_bc10} ₽
        </div>
        <div className={styles.infoBlock}>
          <div className={`${styles.abcCatBlock} ${getStyle('C')}`}>C</div>
          Цена {taskData?.task?.price_c} ₽ / EBITDA {taskData?.task?.deb_c} ₽
        </div>
        <div className={styles.infoBlock}>
          <div className={`${styles.abcCatBlock} ${getStyle('G')}`}>G</div>
          Цена {taskData?.task?.price_g} ₽
        </div>

        {!taskData?.task?.is_completed ? (
          <button className={styles.editButton} onClick={handleClickOnEdit}>
            <IoSettings />
          </button>
        ) : (
          ''
        )}
      </div>
      <div className={styles.tableWrapper}>
        <div className={styles.table}>
          <div className={styles.colForHiding}></div>
          <div className={`${styles.row} ${styles.tableHeader}`}>
            <div className={`${styles.imgCell} ${styles.fixedColumn}`} />
            <div className={styles.cell}>Артикул</div>
            <div className={styles.cell}>ABC 7 день</div>
            <div className={styles.cell}>ABC 14 день</div>
            <div className={styles.cell}>ABC 21 день</div>
            <div className={styles.cell}>ABC 28 день</div>
            <div className={styles.cell}>Целевая цена</div>
            <div className={styles.cell}>Оборачиваемость WB</div>
            <div className={styles.cell}>Остатки WB</div>
          </div>
          {taskData?.sku_list.map((sku) => {
            return (
              <div className={styles.row} key={sku.id}>
                <div className={`${styles.imgCell} ${styles.fixedColumn}`}>
                  <div className={styles.imageBlock}>
                    <div className={styles.abc}>
                      <div className={styles.abcText}>{sku?.abc?.current}</div>
                    </div>
                    <div className={styles.imageSmall}>
                      <LazyLoad display="none" key={uuidv4()} overflow>
                        {sku.image ? (
                          <img
                            src={sku.image}
                            className={styles.zoomImage}
                            alt="Фото"
                          />
                        ) : (
                          'Фото'
                        )}
                      </LazyLoad>
                    </div>
                  </div>
                </div>
                <div
                  className={`${styles.cell} ${styles.vcCell}`}
                  data-value={sku.vendor_code_id}
                  onClick={handleClickOnArt}
                >
                  {sku.vc_name}
                </div>

                <div className={styles.cell}>
                  {sku.abc.day7 ? (
                    <div
                      className={`${styles.abcCatBlock} ${getStyle(
                        sku.abc.day7
                      )}`}
                    >
                      {sku.abc.day7}
                    </div>
                  ) : (
                    <PiEmptyDuotone color="red" />
                  )}
                </div>
                <div className={styles.cell}>
                  {sku.abc.day14 ? (
                    <div
                      className={`${styles.abcCatBlock} ${getStyle(
                        sku.abc.day14
                      )}`}
                    >
                      {sku.abc.day14}
                    </div>
                  ) : (
                    <PiEmptyDuotone color="red" />
                  )}
                </div>
                <div className={styles.cell}>
                  {sku.abc.day21 ? (
                    <div
                      className={`${styles.abcCatBlock} ${getStyle(
                        sku.abc.day21
                      )}`}
                    >
                      {sku.abc.day21}
                    </div>
                  ) : (
                    <PiEmptyDuotone color="red" />
                  )}
                </div>
                <div className={styles.cell}>
                  {sku.abc.day28 ? (
                    <div
                      className={`${styles.abcCatBlock} ${getStyle(
                        sku.abc.day28
                      )}`}
                    >
                      {sku.abc.day28}
                    </div>
                  ) : (
                    <PiEmptyDuotone color="red" />
                  )}
                </div>
                <div className={styles.cell}>
                  {sku?.prices?.target_price ? (
                    sku?.prices?.target_price + ' ₽'
                  ) : (
                    <PiEmptyDuotone color="red" />
                  )}
                </div>
                <div className={styles.cell}>
                  {sku.metrics.turnover_wb === 0 ? (
                    <PiEmptyDuotone color="red" />
                  ) : (
                    sku.metrics.turnover_wb
                  )}
                </div>
                <div className={styles.cell}>
                  {sku.metrics.wb_stocks_daily.split(',').slice(-1) === 0 ? (
                    <PiEmptyDuotone color="red" />
                  ) : (
                    sku.metrics.wb_stocks_daily.split(',').slice(-1)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  ) : (
    <></>
  );
};

export default SingleTaskB28Info;

const getStyle = (category) => {
  switch (category) {
    case 'AAA':
      return styles.aaaCat;
    case 'A':
      return styles.aaaCat;
    case 'B':
      return styles.bCat;
    case 'BC30':
      return styles.bCat;
    case 'C':
      return styles.cCat;
    case 'BC10':
      return styles.cCat;
    case 'G':
      return styles.gCat;
    default:
      return styles.defaultCat;
  }
};
