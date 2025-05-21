import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import TagsSetup from './tags_setup/TagsSetup';
import { fetchAvailableTags } from '../../redux/slices/vendorCodeSlice';
import { selectNotificationMessage } from '../../redux/slices/notificationSlice';

import styles from './style.module.css';
import { hostName } from '../../utils/host';
import TagsDelete from './tags_delete/TagsDelete';

const TagsPage = () => {
  const notificationMessage = useSelector(selectNotificationMessage);
  const dispatch = useDispatch();

  useEffect(() => {
    if (notificationMessage === '') {
      dispatch(fetchAvailableTags(`${hostName}/tags/all_tags`));
    }
  }, [notificationMessage]);
  return (
    <section>
      <h1>Работа с тегами</h1>
      <div className={styles.tagsBlock}>
        <TagsSetup />
        <TagsDelete />
      </div>
    </section>
  );
};

export default TagsPage;
