import { useDispatch, useSelector } from 'react-redux';
import { FaSpinner } from 'react-icons/fa';
import {
  fetchAbcInfo,
  selectAbcData,
  selectCategories,
  selectIsLoading,
} from '../../redux/slices/abcSlice';
import { selectNotificationMessage } from '../../redux/slices/notificationSlice';
import AbcDefaultInfo from './abc_default_info/AbcDefaultInfo';
import AbcOthers from './abc_others/AbcOthers';
import { useEffect } from 'react';
import { hostName } from '../../utils/host';

const AbcPage = () => {
  const dispatch = useDispatch();
  const isLoading = useSelector(selectIsLoading);
  const abcData = useSelector(selectAbcData);
  const categories = useSelector(selectCategories);
  const notificationMessage = useSelector(selectNotificationMessage);

  useEffect(() => {
    if (notificationMessage === '') {
      dispatch(fetchAbcInfo(`${hostName}/abc_default/`));
    }
  }, [dispatch, notificationMessage]);

  const defaultData = abcData.filter((abcRow) => {
    return abcRow.id === 1;
  });
  return (
    <>
      {isLoading ? (
        <FaSpinner className="spinner" />
      ) : (
        <section>
          <h1>ABC-критерии</h1>
          <div>
            <AbcDefaultInfo defaultData={defaultData[0]} />
            <AbcOthers abcData={abcData} categories={categories} />
          </div>
        </section>
      )}
    </>
  );
};

export default AbcPage;
