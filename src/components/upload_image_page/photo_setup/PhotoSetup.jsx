import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import { IoMdRefresh } from 'react-icons/io';
import { IoCheckmarkCircleOutline } from 'react-icons/io5';
import { FaSpinner } from 'react-icons/fa';
import { RiDeleteBin6Line } from 'react-icons/ri';

import { MdOutlineFileUpload } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';
import { setError } from '../../../redux/slices/errorSlice';

import { hostName } from '../../../utils/host';

import excelLogo from './excel-icon.png';
import styles from './style.module.css';
import {
  uploadPhoto,
  selectFailedSkus,
  selectIsLoading,
} from '../../../redux/slices/systemSlice';

const PhotoSetup = ({}) => {
  const [activeSide, setActiveSide] = useState('left');
  const [showContent, setShowContent] = useState('left');
  const [skuList, setSkuList] = useState([]);
  const [excelLastUploaded, setExcelLastUploaded] = useState(false);
  const [excelFixUploaded, setExcelFixUploaded] = useState(false);
  const [imageBase64, setImageBase64] = useState('');
  const [position, setPosition] = useState('');
  const failedSkus = useSelector(selectFailedSkus);
  const isLoading = useSelector(selectIsLoading);

  const dispatch = useDispatch();

  // Отложенное отображение содержимого
  useEffect(() => {
    const timeout = setTimeout(() => {
      setShowContent(activeSide);
    }, 300); // match with CSS transition duration

    return () => clearTimeout(timeout);
  }, [activeSide]);

  const validateSKUs = (articles) => {
    return articles.every((sku) => /^[0-9]+$/.test(sku));
  };

  const handleExcelUpload = (e) => {
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

      if (!validateSKUs(articles)) {
        dispatch(setError('Файл содержит некорректные SKU!'));
        return;
      }

      setSkuList(articles);

      if (activeSide === 'left') {
        setExcelFixUploaded(true);
      } else {
        setExcelLastUploaded(true);
      }
    };

    reader.readAsBinaryString(file);
  };

  const handleAttachPhoto = () => {
    const payload = {
      base64: imageBase64,
      sku_list: skuList,
      pos_num: activeSide === 'left' ? Number(position) : 100,
    };

    dispatch(
      uploadPhoto({
        data: payload,
        url: `${hostName}/system/upload_photo`,
      })
    );
  };

  console.log(isLoading);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith('image/')) return;

    const reader = new FileReader();
    reader.onloadend = () => {
      setImageBase64(reader.result);
    };
    reader.readAsDataURL(file);
  };

  const handleDeletePhoto = (e) => {
    setImageBase64('');
  };

  const handlePositionChange = (e) => {
    const value = e.target.value;
    if (/^\d{0,2}$/.test(value) && (+value <= 30 || value === '')) {
      setPosition(value);
    }
  };

  const canAttachTags =
    skuList.length > 0 &&
    imageBase64 !== '' &&
    ((activeSide === 'right' && excelLastUploaded) ||
      (activeSide === 'left' && position !== '' && excelFixUploaded));

  return (
    <>
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
                <h2>Добавление фото на фиксированную позицию</h2>
                <div className={styles.mainBlock}>
                  <div className={styles.leftInfoBlock}>
                    <div className={styles.description}>
                      Данный инструмент загружает фото на выбранную позицию,
                      удаляя при этом старое изображение, которое было на той же
                      позиции. Введите позицию (не больше 30-ой), загрузите фото
                      и список артикулов.
                    </div>
                    <div className={styles.posInputBlock}>
                      <span>Позиция для загрузки: </span>
                      <input
                        type="number"
                        min={1}
                        max={30}
                        value={position}
                        onChange={handlePositionChange}
                        className={styles.posInput}
                      />
                    </div>
                  </div>

                  <div>
                    <div className={styles.photoPlaceHolder}>
                      {imageBase64 ? (
                        <div>
                          <img
                            src={imageBase64}
                            alt="Uploaded"
                            style={{
                              maxHeight: '200px',
                              minHeight: '200px',
                              borderRadius: '0.5rem',
                              maxWidth: '150px',
                            }}
                          />
                          <div className={styles.actionsWPhoto}>
                            <label>
                              <IoMdRefresh className={styles.refreshButton} />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                hidden
                              />
                            </label>
                            <RiDeleteBin6Line
                              className={styles.resetPhotoButton}
                              onClick={handleDeletePhoto}
                            />
                          </div>
                        </div>
                      ) : (
                        <label className={styles.uploadImageBtn}>
                          <div className={styles.noPhotoBox}>
                            Загрузить фото
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              hidden
                            />
                          </div>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.bottomBox}>
                  <div className={styles.infoText}>
                    Выберите xlsx-файл, который содержит одну колонку без шапки.
                    В колонке - артикулы (SKU), для которых надо добавить фото.
                  </div>

                  {excelFixUploaded ? (
                    <>
                      <div>
                        <button className={`${styles.uploadedBtn} disabled`}>
                          <IoCheckmarkCircleOutline className={styles.icon} />
                          Загружено ({skuList.length} SKU)
                        </button>
                      </div>
                    </>
                  ) : (
                    <label className={styles.uploadBtn}>
                      <img
                        src={excelLogo}
                        alt="Excel"
                        className={styles.icon}
                      />
                      Загрузить файл
                      <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleExcelUpload}
                        hidden
                      />
                    </label>
                  )}
                  {canAttachTags && !isLoading && (
                    <div>
                      <button
                        className={styles.actionBtn}
                        onClick={handleAttachPhoto}
                      >
                        <MdOutlineFileUpload className={styles.icon} />
                        Добавить фото
                      </button>
                    </div>
                  )}
                  {isLoading ? (
                    <div className={styles.loadingBox}>
                      <FaSpinner className={styles.loadingSpinner} />
                      <span>Загрузка...</span>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.verticalLabel}>
                Добавление фото на фиксированную позицию
              </div>
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
                <h2>Добавление фото на последнюю позицию</h2>
                <div className={styles.mainBlock}>
                  <div className={styles.leftInfoBlock}>
                    <div className={styles.description}>
                      Данный инструмент загружает фото на последнюю позицию. Он
                      сам определит, сколько у каждого артикула уже есть фото, и
                      добавит его в конец. Необхобимо загрузить фото и список
                      артикулов.
                    </div>
                  </div>

                  <div>
                    <div className={styles.photoPlaceHolder}>
                      {imageBase64 ? (
                        <div>
                          <img
                            src={imageBase64}
                            alt="Uploaded"
                            style={{
                              maxHeight: '200px',
                              minHeight: '200px',
                              borderRadius: '0.5rem',
                              maxWidth: '150px',
                            }}
                          />
                          <div className={styles.actionsWPhoto}>
                            <label>
                              <IoMdRefresh className={styles.refreshButton} />
                              <input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                hidden
                              />
                            </label>
                            <RiDeleteBin6Line
                              className={styles.resetPhotoButton}
                              onClick={handleDeletePhoto}
                            />
                          </div>
                        </div>
                      ) : (
                        <label className={styles.uploadImageBtn}>
                          <div className={styles.noPhotoBox}>
                            Загрузить фото
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleImageUpload}
                              hidden
                            />
                          </div>
                        </label>
                      )}
                    </div>
                  </div>
                </div>
                <div className={styles.bottomBox}>
                  <div className={styles.infoText}>
                    Выберите xlsx-файл, который содержит одну колонку без шапки.
                    В колонке - артикулы (SKU), для которых надо добавить фото.
                  </div>

                  {excelLastUploaded ? (
                    <>
                      <div>
                        <button className={`${styles.uploadedBtn} disabled`}>
                          <IoCheckmarkCircleOutline className={styles.icon} />
                          Загружено ({skuList.length} SKU)
                        </button>
                      </div>
                    </>
                  ) : (
                    <label className={styles.uploadBtn}>
                      <img
                        src={excelLogo}
                        alt="Excel"
                        className={styles.icon}
                      />
                      Загрузить файл
                      <input
                        type="file"
                        accept=".xlsx, .xls"
                        onChange={handleExcelUpload}
                        hidden
                      />
                    </label>
                  )}
                  {canAttachTags && !isLoading && (
                    <div>
                      <button
                        className={styles.actionBtn}
                        onClick={handleAttachPhoto}
                      >
                        <MdOutlineFileUpload className={styles.icon} />
                        Добавить фото
                      </button>
                    </div>
                  )}
                  {isLoading ? (
                    <div className={styles.loadingBox}>
                      <FaSpinner className={styles.loadingSpinner} />
                      <span>Загрузка...</span>
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
              </div>
            ) : (
              <div className={styles.verticalLabel}>
                Добавление фото на последнюю позицию
              </div>
            )}
          </div>
        </div>
      </div>
      {failedSkus.length > 0 && (
        <div className={styles.failedBlock}>
          <strong>Ошибка загрузки для артикулов:</strong>
          <div className={styles.failedSkusBox}>
            {failedSkus.map((sku) => (
              <div key={sku}>{sku}</div>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

export default PhotoSetup;
