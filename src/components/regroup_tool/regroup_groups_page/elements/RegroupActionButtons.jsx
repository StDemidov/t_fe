import { useDispatch, useSelector } from 'react-redux';
import {
  returnToStart,
  selectRegroupedItems,
  updateGroups,
} from '../../../../redux/slices/regroupSlice';

import styles from './style.module.css';
import { hostName } from '../../../../utils/host';

const RegroupActionButtons = () => {
  const groups = useSelector(selectRegroupedItems);
  const dispatch = useDispatch();
  const handleClickOnReturn = () => {
    dispatch(returnToStart());
  };

  const handleClickOnRegroup = () => {
    const data = {
      groups: groups.map((innerList) => innerList.map((item) => item.sku)),
    };
    dispatch(
      updateGroups({
        data: data,
        url: `${hostName}/card_grouping/group_cards_on_wb`,
      })
    );
  };
  return (
    <div className={styles.actionButtons}>
      <button onClick={handleClickOnReturn}>В начало</button>
      <button onClick={handleClickOnRegroup}>Применить распределение</button>
    </div>
  );
};

export default RegroupActionButtons;
