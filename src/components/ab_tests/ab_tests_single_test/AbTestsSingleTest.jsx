import { useEffect } from 'react';
import styles from './style.module.css';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchSingleABTest,
  selectSingleAbTest,
} from '../../../redux/slices/abTestsSlice';
import { hostName } from '../../../utils/host';
import SingleAbTestCompleted from './SingleAbTestCompleted';
import SingleAbTestActive from './SingleAbTestActive';

const AbTestsSingleTest = () => {
  const { id } = useParams();
  const tasks = useSelector(selectSingleAbTest);
  const dispatch = useDispatch();

  let task = tasks[id];

  useEffect(() => {
    dispatch(fetchSingleABTest(`${hostName}/ab_tests/single_tests/${id}`));
  }, []);
  return (
    <section>
      <div className={styles.mainBox}>
        {task?.isCompleted ? (
          <SingleAbTestCompleted task={task} />
        ) : (
          <SingleAbTestActive task={task} />
        )}
      </div>
    </section>
  );
};

export default AbTestsSingleTest;
