import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import { MdOutlineFileUpload } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';

import {
  selectAvailableTagsCloth,
  selectAvailableTagsMain,
  selectAvailableTagsOthers,
} from '../../../redux/slices/vendorCodeSlice';

import { uploadNewTags } from '../../../redux/slices/vendorCodeSlice';

import { hostName } from '../../../utils/host';

import excelLogo from './excel-icon.png';
import styles from './style.module.css';

const TagsSetup = ({}) => {
  const [activeSide, setActiveSide] = useState('left');
  const [showContent, setShowContent] = useState('left');
  const [category, setCategory] = useState('main');
  const [method1Uploaded, setMethod1Uploaded] = useState(false);
  const [method2Uploaded, setMethod2Uploaded] = useState(false);

  const tagsByType = {
    main: useSelector(selectAvailableTagsMain),
    cloth: useSelector(selectAvailableTagsCloth),
    others: useSelector(selectAvailableTagsOthers),
  };

  const [chosenTags, setChosenTags] = useState([]);

  const dispatch = useDispatch();

  const [tagsMap, setTagsMap] = useState({});
  const [articlesList, setArticlesList] = useState([]);

  // Отложенное отображение содержимого
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowContent(activeSide);
    }, 300); // match with CSS transition duration

    return () => clearTimeout(timeout);
  }, [activeSide]);

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

  const handleMethod1Upload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
        defval: '',
      });

      const result = {};
      data.forEach(([article, tag]) => {
        if (!tag || !article) return;
        if (!result[tag]) result[tag] = [];
        result[tag].push(article);
      });

      setTagsMap(result);
      setMethod1Uploaded(true);
    };
    reader.readAsBinaryString(file);
  };

  const handleMethod2Upload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target.result;
      const workbook = XLSX.read(bstr, { type: 'binary' });
      const sheetName = workbook.SheetNames[0];
      const data = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName], {
        header: 1,
        defval: '',
      });

      const articles = data.map((row) => row[0]).filter(Boolean);
      setArticlesList(articles);
      setMethod2Uploaded(true);
    };
    reader.readAsBinaryString(file);
  };

  const handleAttachTagsMethod1 = () => {
    const data = {
      type: category,
      tags: tagsMap,
    };

    dispatch(
      uploadNewTags({
        data: data,
        url: `${hostName}/tags/add_tags_new`,
      })
    );
    setMethod1Uploaded(false);
    setTagsMap({});
    // Тут будет логика
  };

  const handleAttachTagsMethod2 = () => {
    const data = {
      type: category,
      tags: chosenTags,
      skus: articlesList,
    };

    dispatch(
      uploadNewTags({
        data: data,
        url: `${hostName}/tags/add_tags_existing`,
      })
    );
    setMethod2Uploaded(false);
    setChosenTags([]);
    setArticlesList([]);

    // Тут будет логика
  };

  return (
    <div className={styles.toggleContainer}>
      <div className={styles.toggleBlock}>
        {/* Левая часть */}
        <div
          className={`${styles.toggleSide} ${styles.left} ${
            activeSide === 'left'
              ? `${styles.active} ${styles.wide}`
              : `${styles.inactive} ${styles.narrow}`
          }`}
          onClick={() => setActiveSide('left')}
        >
          {activeSide === 'left' ? (
            <div
              className={`${styles.toggleContent} ${
                showContent === 'left' ? styles.visible : styles.hidden
              }`}
            >
              <h2>Добавление новых тегов</h2>
              <div>
                <p>Тип добавляемых тегов</p>
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

              <div className={styles.infoText}>
                Выберите xlsx-файл, который содержит две колонки без шапки. В
                первой колонке - артикулы, во второй колонке - название нового
                тега. Названия должны быть уникальными, иначе тег не добавится.
              </div>

              {method1Uploaded ? (
                <>
                  <div>
                    <button className={`${styles.uploadedBtn} disabled`}>
                      <IoCheckmarkCircleOutline className={styles.icon} />
                      Загружено
                    </button>
                  </div>
                  <div>
                    <button
                      className={styles.actionBtn}
                      onClick={handleAttachTagsMethod1}
                    >
                      <MdOutlineFileUpload className={styles.icon} />
                      Привязать теги
                    </button>
                  </div>
                </>
              ) : (
                <label className={styles.uploadBtn}>
                  <img src={excelLogo} alt="Excel" className={styles.icon} />
                  Загрузить файл
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleMethod1Upload}
                    hidden
                  />
                </label>
              )}
            </div>
          ) : (
            <div className={styles.verticalLabel}>Добавление новых тегов</div>
          )}
        </div>

        {/* Правая часть */}
        <div
          className={`${styles.toggleSide} ${styles.right} ${
            activeSide === 'right'
              ? `${styles.active} ${styles.wide}`
              : `${styles.inactive} ${styles.narrow}`
          }`}
          onClick={() => setActiveSide('right')}
        >
          {activeSide === 'right' ? (
            <div
              className={`${styles.toggleContent} ${
                showContent === 'right' ? styles.visible : styles.hidden
              }`}
            >
              <h2>Добавление существующего тега</h2>
              <div>
                <p>Тип добавляемого тега</p>
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
              <p>Выберите теги, которые хотите добавить</p>
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
                Выберите xlsx-файл, который содержит одну колонку без шапки. В
                колонке - артикулы, для которых надо добавить выбранные теги. За
                раз можно добавить только теги одного типа.
              </div>
              {method2Uploaded ? (
                <>
                  <div>
                    <button className={`${styles.uploadedBtn} disabled`}>
                      <IoCheckmarkCircleOutline className={styles.icon} />{' '}
                      Загружено
                    </button>
                  </div>
                  <div>
                    <button
                      className={styles.actionBtn}
                      onClick={handleAttachTagsMethod2}
                    >
                      <MdOutlineFileUpload className={styles.icon} />
                      Привязать теги
                    </button>
                  </div>
                </>
              ) : (
                <label className={styles.uploadBtn}>
                  <img src={excelLogo} alt="Excel" className={styles.icon} />
                  Загрузить файл
                  <input
                    type="file"
                    accept=".xlsx, .xls"
                    onChange={handleMethod2Upload}
                    hidden
                  />
                </label>
              )}
            </div>
          ) : (
            <div className={styles.verticalLabel}>
              Добавление существующего тега
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TagsSetup;
