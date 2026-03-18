import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchAllItems,
  selectAllItems,
  selectAllItemsIsLoading,
  selectGroupsUpdateInProcess,
  selectGroupsUpdateIsFinished,
  selectRegroupingIsLoading,
  selectRegroupIsCalculated,
} from '../../redux/slices/regroupSlice';
import RegroupPreparingPage from './regroup_preparing_page/RegroupPreparingPage';
import { hostName } from '../../utils/host';

const MainRegroupPage = () => {
  const allItemsIsLoading = useSelector(selectAllItemsIsLoading);
  const regroupingIsLoading = useSelector(selectRegroupingIsLoading);
  const regroupIsCalculated = useSelector(selectRegroupIsCalculated);
  const groupsUpdateInProcess = useSelector(selectGroupsUpdateInProcess);
  const groupsUpdateIsFinished = useSelector(selectGroupsUpdateIsFinished);

  const allItems = useSelector(selectAllItems);

  const dispatch = useDispatch();

  useEffect(() => {
    dispatch(fetchAllItems(`${hostName}/card_grouping/get_full_vc_data`));
  }, []);

  return (
    <div>
      <section>
        <h1>Перераспределение карточек товаров</h1>
        {!allItemsIsLoading &&
          !regroupIsCalculated &&
          !groupsUpdateIsFinished && (
            <RegroupPreparingPage allItems={allItems} />
          )}
      </section>
    </div>
  );
};

export default MainRegroupPage;
