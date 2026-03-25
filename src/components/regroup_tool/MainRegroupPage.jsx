import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllItems,
  returnToStart,
  selectAllItems,
  selectAllItemsIsLoading,
  selectCheckUnfilledSKUs,
  selectGroupsUpdateInProcess,
  selectGroupsUpdateIsFinished,
  selectRegroupingIsLoading,
  selectRegroupIsCalculated,
  selectUploadingPatternsIsLoading,
  setCheckUnfilledSkus,
} from '../../redux/slices/regroupSlice';
import RegroupPreparingPage from './regroup_preparing_page/RegroupPreparingPage';
import { hostName } from '../../utils/host';
import { FaSpinner } from 'react-icons/fa';
import RegroupGroupsPage from './regroup_groups_page/RegroupGroupsPage';
import RegroupFinalPage from './regroup_final_page/RegroupFinalPage';
import RegroupUnfilledSkusPage from './regroup_unfilled_skus_page/RegroupUnfilledSkusPage';

import styles from './style.module.css';

const MainRegroupPage = () => {
  const allItemsIsLoading = useSelector(selectAllItemsIsLoading);
  const regroupingIsLoading = useSelector(selectRegroupingIsLoading);
  const regroupIsCalculated = useSelector(selectRegroupIsCalculated);
  const groupsUpdateInProcess = useSelector(selectGroupsUpdateInProcess);
  const groupsUpdateIsFinished = useSelector(selectGroupsUpdateIsFinished);
  const checkUnfilledSKUS = useSelector(selectCheckUnfilledSKUs);
  const uploadingPatternsIsLoading = useSelector(
    selectUploadingPatternsIsLoading
  );

  const allItems = useSelector(selectAllItems);

  const dispatch = useDispatch();

  useEffect(() => {
    if (!uploadingPatternsIsLoading) {
      dispatch(fetchAllItems(`${hostName}/card_grouping/get_full_vc_data`));
    }
  }, [uploadingPatternsIsLoading]);

  const handleViewUnfilledSkus = () => {
    dispatch(setCheckUnfilledSkus(true));
  };

  const handleClickOnReturn = () => {
    dispatch(returnToStart());
  };

  if (checkUnfilledSKUS) {
    return (
      <div>
        <section>
          <div className={styles.header}>
            <h1>Товары с незаполенными данными</h1>
            <button
              className={styles.headerButton}
              onClick={handleClickOnReturn}
            >
              Вернуться в начало
            </button>
          </div>
          <RegroupUnfilledSkusPage allItems={allItems} />
        </section>
      </div>
    );
  }

  return (
    <div>
      <section>
        <div className={styles.header}>
          <h1>Перераспределение карточек товаров</h1>
          {!regroupIsCalculated && (
            <button
              onClick={handleViewUnfilledSkus}
              className={styles.headerButton}
            >
              Посмотреть незаполненные артикулы
            </button>
          )}
        </div>
        {!allItemsIsLoading &&
          !regroupIsCalculated &&
          !groupsUpdateIsFinished && (
            <RegroupPreparingPage allItems={allItems} />
          )}
        {(regroupingIsLoading || groupsUpdateInProcess) && (
          <FaSpinner className="spinner" />
        )}
        {regroupIsCalculated &&
          !groupsUpdateInProcess &&
          !groupsUpdateIsFinished && <RegroupGroupsPage />}
        {groupsUpdateIsFinished && <RegroupFinalPage />}: ''
      </section>
    </div>
  );
};

export default MainRegroupPage;
