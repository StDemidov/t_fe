import LazyLoad from 'react-lazyload';
import { useParams, useNavigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { PiEmptyDuotone } from 'react-icons/pi';
import { IoSettings } from 'react-icons/io5';
import { v4 as uuidv4 } from 'uuid';

import {
  fetchTaskDrainById,
  selectTaskSingle,
} from '../../../../redux/slices/tasksDrainSlice';

import styles from './style.module.css';
import BarplotDrain from '../../../barplot_drain/BarplotDrain';
import { hostName } from '../../../../utils/host';

const SingleTaskDrainInfo = () => {
  const navigation = useNavigate();
  const dispatch = useDispatch();
  const taskData = useSelector(selectTaskSingle);
  let { id } = useParams();

  const handleClickOnArt = (event) => {
    const vc_id = event.currentTarget.getAttribute('data-value');
    navigation(`/vendorcodes/${vc_id}`);
  };

  const handleClickOnEdit = () => {
    navigation(`/tools/tasks_drain/edit/${id}`);
  };

  useEffect(() => {
    dispatch(fetchTaskDrainById(`${hostName}/tasksdrain/${id}`));
  }, [dispatch]);
  return taskData?.task?.id == id ? (
    <section>
      <h1>{taskData?.task?.task_name} </h1>
      <div className={styles.taskInfo}>
        <div className={styles.infoBlock}>
          Шаг повышения: {taskData?.task?.increase_step} ₽
        </div>

        <div className={styles.infoBlock}>
          Шаг снижения: {taskData?.task?.decrease_step} ₽
        </div>
        <div className={styles.infoBlock}>
          Дедлайн: {taskData?.task?.deadline}{' '}
        </div>
        {!taskData?.task?.completed ? (
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
            <div className={styles.cell}>История цен</div>
            <div className={styles.cell}>Текущая цена</div>
            <div className={styles.cell}>Последнее изменение</div>
            <div className={styles.cell}>Оборачиваемость WB</div>
            <div className={styles.cell}>Остатки WB</div>
          </div>
          {taskData?.sku_list.map((sku) => {
            return (
              <div className={styles.row} key={sku.id}>
                <div className={`${styles.imgCell} ${styles.fixedColumn}`}>
                  <div className={styles.imageBlock}>
                    <div className={styles.abc}>
                      <div className={styles.abcText}>{sku.current_abc}</div>
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
                  <LazyLoad key={uuidv4()} offset={100}>
                    <div>
                      <BarplotDrain
                        data={sku.changes_history}
                        dates={sku.dates_history}
                      />
                    </div>
                  </LazyLoad>
                </div>
                <div className={styles.cell}>
                  {sku.current_price ? (
                    sku.current_price
                  ) : (
                    <PiEmptyDuotone color="red" />
                  )}
                </div>
                <div className={styles.cell}>
                  {sku.last_change === '' ? (
                    <PiEmptyDuotone color="red" />
                  ) : (
                    sku.last_change
                  )}
                </div>
                <div className={styles.cell}>
                  {sku.turnover_wb === 0 ? (
                    <PiEmptyDuotone color="red" />
                  ) : (
                    sku.turnover_wb
                  )}
                </div>
                <div className={styles.cell}>
                  {sku.wb_stocks === 0 ? (
                    <PiEmptyDuotone color="red" />
                  ) : (
                    sku.wb_stocks
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

export default SingleTaskDrainInfo;
