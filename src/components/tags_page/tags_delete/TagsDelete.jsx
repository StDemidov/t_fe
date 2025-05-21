import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RiDeleteBin2Fill } from 'react-icons/ri';

import {
  selectAvailableTagsCloth,
  selectAvailableTagsMain,
  selectAvailableTagsOthers,
  deleteTags,
} from '../../../redux/slices/vendorCodeSlice';

import { hostName } from '../../../utils/host';

import styles from './style.module.css';

const TagsDelete = ({}) => {
  const [category, setCategory] = useState('main');

  const tagsByType = {
    main: useSelector(selectAvailableTagsMain),
    cloth: useSelector(selectAvailableTagsCloth),
    others: useSelector(selectAvailableTagsOthers),
  };

  const [chosenTags, setChosenTags] = useState([]);

  const dispatch = useDispatch();

  // Отложенное отображение содержимого

  useEffect(() => {
    setChosenTags([]);
  }, [category]);

  const handeClickOnTag = (e) => {
    const tag = e.currentTarget.getAttribute('data-value');
    if (chosenTags.includes(tag)) {
      const newList = chosenTags.filter((elem) => {
        return elem !== tag;
      });
      setChosenTags(newList);
    } else {
      setChosenTags([].concat(chosenTags, tag));
    }
  };

  const handleClickOnDeleteBtn = () => {
    const data = {
      type: category,
      tags: chosenTags,
    };
    dispatch(
      deleteTags({
        data: data,
        url: `${hostName}/tags/delete_tags`,
      })
    );
    setChosenTags([]);
  };

  return (
    <div className={styles.toggleContainer}>
      <div className={styles.toggleSide}>
        <div className={styles.toggleContent}>
          <h2>Удаление тегов</h2>
          <div>
            <p>Тип тегов</p>
            <div className={styles.tagCategoryList}>
              <div
                className={`${styles.tagCategory} ${
                  category === 'main' ? styles.activeCategory : ''
                }`}
                onClick={() => setCategory('main')}
              >
                Основные
              </div>
              <div
                className={`${styles.tagCategory} ${
                  category === 'cloth' ? styles.activeCategory : ''
                }`}
                onClick={() => setCategory('cloth')}
              >
                Ткань
              </div>
              <div
                className={`${styles.tagCategory} ${
                  category === 'others' ? styles.activeCategory : ''
                }`}
                onClick={() => setCategory('others')}
              >
                Дополнительные
              </div>
            </div>
          </div>
          <br />
          <p>Выберите теги, которые хотите удалить</p>
          <div className={styles.tagsField}>
            {tagsByType[category].map((tag) => (
              <span
                className={`${styles.tag} ${
                  chosenTags.includes(tag) ? styles.tagChosen : ''
                }`}
                onClick={handeClickOnTag}
                data-value={tag}
                key={tag}
              >
                {tag}
              </span>
            ))}
          </div>
          <div className={styles.infoText}>
            Данная операция полностью удалит тег и отвяжет от него всего
            артикулы, которым он приписан.
          </div>
          {chosenTags.length ? (
            <div>
              <button
                className={`${styles.deleteBtn}`}
                onClick={handleClickOnDeleteBtn}
              >
                <RiDeleteBin2Fill className={styles.icon} /> Удалить теги
              </button>
            </div>
          ) : (
            <></>
          )}
        </div>
      </div>
    </div>
  );
};

export default TagsDelete;
