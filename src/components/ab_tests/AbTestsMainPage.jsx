import { useNavigate } from 'react-router-dom';
import { IoIosCheckmarkCircle } from 'react-icons/io';
import { RiTestTubeFill } from 'react-icons/ri';
import { IoWarning, IoSearch } from 'react-icons/io5';
import { TbMoodPuzzled, TbMoodCheck } from 'react-icons/tb';

import TestingAnimation from '../testing_animation/TestingAnimation';

import styles from './style.module.css';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect } from 'react';
import { fetchABTests, selectABTests } from '../../redux/slices/abTestsSlice';
import { hostName } from '../../utils/host';
import AbTestCompleted from './ab_tests_cards/AbTestCompleted';
import AbTestActive from './ab_tests_cards/AbTestActive';
import AbTestFailed from './ab_tests_cards/AbTestFailed';
import {
  selectAbTestActiveVCNameFilter,
  selectAbTestCompletedVCNameFilter,
} from '../../redux/slices/filterSlice';
import VCNameFilter from './filters/vc_name_filter/VCNameFilter';

const AbTestsMainPage = () => {
  const navigation = useNavigate();
  const dispatch = useDispatch();
  const abTests = useSelector(selectABTests);
  const activeVCNameFilter = useSelector(selectAbTestActiveVCNameFilter);
  const completedVCNameFilter = useSelector(selectAbTestCompletedVCNameFilter);

  useEffect(() => {
    dispatch(fetchABTests(`${hostName}/ab_tests/all_tests`));
  }, []);

  const handleClickOnCreate = () => {
    navigation(`/tools/ab_tests/create`);
  };

  const completedAbTests = abTests.completed.filter((item) => {
    let vcNameMatch = true;
    if (completedVCNameFilter.length !== 0) {
      if (isNaN(completedVCNameFilter)) {
        vcNameMatch = item.vcName
          .toLowerCase()
          .includes(completedVCNameFilter.toLowerCase());
      } else {
        vcNameMatch = item.sku.toLowerCase().includes(completedVCNameFilter);
      }
    }
    return vcNameMatch;
  });

  const activeAbTests = abTests.active.filter((item) => {
    let vcNameMatch = true;
    if (activeVCNameFilter.length !== 0) {
      if (isNaN(activeVCNameFilter)) {
        vcNameMatch = item.vcName
          .toLowerCase()
          .includes(activeVCNameFilter.toLowerCase());
      } else {
        vcNameMatch = item.sku.toLowerCase().includes(activeVCNameFilter);
      }
    }
    return vcNameMatch;
  });

  return (
    <section>
      <div className={styles.headerRow}>
        <h1>A/B тесты</h1>
        <button className={styles.newTestButton} onClick={handleClickOnCreate}>
          Создать новый тест
        </button>
      </div>
      <div className={styles.mainBodyBlock}>
        <div className={styles.rightPart}>
          <div className={styles.completedTests}>
            <div className={styles.blockTestsHeader}>
              <IoIosCheckmarkCircle color="green" /> Завершенные тесты
              <VCNameFilter type={'completed'} />
            </div>
            <div className={styles.blockBody}>
              {completedAbTests.length ? (
                <>
                  {completedAbTests.map((test) => {
                    return <AbTestCompleted test={test} key={test.testId} />;
                  })}{' '}
                </>
              ) : (
                <div className={styles.emptyBlock}>
                  <TbMoodPuzzled className={styles.emptyBlockIcon} />{' '}
                  <div className={styles.emptyBlockText}>
                    Завершенных тестов не обнаружено
                  </div>
                </div>
              )}
            </div>
          </div>
          <div className={styles.activeTests}>
            <div className={styles.blockTestsHeader}>
              <RiTestTubeFill color="violet" />
              Активные тесты
              <VCNameFilter type={'active'} />
            </div>
            <div className={styles.blockBody}>
              {activeAbTests.length ? (
                <>
                  {activeAbTests.map((test) => {
                    return <AbTestActive test={test} key={test.testId} />;
                  })}
                </>
              ) : (
                <div className={styles.emptyBlock}>
                  <TbMoodPuzzled className={styles.emptyBlockIcon} />{' '}
                  <div className={styles.emptyBlockText}>
                    Активных тестов не обнаружено
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className={styles.leftPart}>
          <div className={styles.blockTestsHeader}>
            <IoWarning color="orange" />
            Не запущенные тесты
            <div className={styles.searchBox}>
              <IoSearch />
              <input
                disabled={true}
                type="text"
                placeholder="SKU или артикул"
                className={styles.searchInput}
              />
            </div>
          </div>
          <div className={styles.blockBody}>
            {abTests.failed.length ? (
              <>
                {abTests.failed.map((test) => {
                  return <AbTestFailed test={test} key={test.testId} />;
                })}
              </>
            ) : (
              <div className={styles.emptyBlock}>
                <TbMoodCheck className={styles.emptyBlockIcon} />{' '}
                <div className={styles.emptyBlockText}>
                  Тестов с ошибками не обнаружено
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      {/* <TestingAnimation /> */}
    </section>
  );
};

export default AbTestsMainPage;
