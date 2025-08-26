import { IoSearch } from 'react-icons/io5';
import { IoIosCheckmarkCircle, IoMdSettings } from 'react-icons/io';
import { FaCirclePlay } from 'react-icons/fa6';
import {
  MdOutlineError,
  MdOutlineArrowBackIos,
  MdOutlineArrowForwardIos,
} from 'react-icons/md';

import { useEffect, useState, useMemo, useRef } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import { motion, AnimatePresence } from 'framer-motion';

import {
  fetchSkuList,
  selectSkuListForAbTest,
  getImagesAndSettings,
  selectStatusSteps,
  selectFinalSettings,
  resetFinalResultSettings,
  resetIntermediateStatusCreating,
  resetIntermediateStatusSettings,
  selectStatusStepsCreating,
  startTest,
  selectFinalResult,
  resetFinalResultCreating,
} from '../../../redux/slices/abTestsSlice';
import { setError } from '../../../redux/slices/errorSlice';
import { hostName } from '../../../utils/host';
import styles from './style.module.css';
import AnimatedNumber from '../../AnimatedNumber/AnimatedNumber';

const AbTestCreate = () => {
  const dispatch = useDispatch();
  const skuList = useSelector(selectSkuListForAbTest);
  const steps = useSelector(selectStatusSteps);
  const stepsCreating = useSelector(selectStatusStepsCreating);
  const finalSettings = useSelector(selectFinalSettings);
  const finalResult = useSelector(selectFinalResult);

  const [skuToFind, setSkuToFind] = useState('');
  const [sku, setSku] = useState(undefined);
  const [validSku, setValidSku] = useState(false);

  const [selectedPhotos, setSelectedPhotos] = useState([]);
  const [showsPerPhoto, setShowsPerPhoto] = useState(2000);
  const [cpm, setCpm] = useState(
    finalSettings?.settings?.cpm ? finalSettings.settings.cpm : 150
  );
  const [accountType, setAccountType] = useState(null);

  const photosContainerRef = useRef(null);

  const minCPM = finalSettings?.settings?.cpm
    ? finalSettings.settings.cpm
    : 150;
  const minBudget = finalSettings?.settings?.min_budget
    ? finalSettings.settings.min_budget
    : 1000;

  const accounts = [
    { key: 'balance', label: 'Счёт', value: finalSettings?.balance?.balance },
    { key: 'net', label: 'Баланс', value: finalSettings?.balance?.net },
    { key: 'bonus', label: 'Бонусы', value: finalSettings?.balance?.bonus },
  ];

  useEffect(() => {
    dispatch(resetFinalResultSettings());
    dispatch(resetIntermediateStatusCreating());
    dispatch(resetIntermediateStatusSettings());
    dispatch(resetFinalResultCreating());
    dispatch(fetchSkuList(`${hostName}/ab_tests/sku_list_for_ab`));
  }, []);

  const handleVCNameChange = (e) => {
    setSkuToFind(e.target.value);
  };

  const togglePhoto = (url) => {
    setSelectedPhotos((prev) =>
      prev.includes(url) ? prev.filter((p) => p !== url) : [...prev, url]
    );
  };

  // цвета для слайдеров

  const scrollCarousel = (dir) => {
    if (photosContainerRef.current) {
      photosContainerRef.current.scrollBy({
        left: dir === 'left' ? -200 : 200,
        behavior: 'smooth',
      });
    }
  };

  // формула бюджета
  const calculatedBudget = useMemo(() => {
    if (!selectedPhotos.length) {
      return minBudget;
    }
    let raw = (selectedPhotos.length * showsPerPhoto * cpm) / 1000;
    raw += raw * 0.1; // +10%
    if (raw < minBudget) raw = minBudget;
    return Math.round(raw / 100) * 100;
  }, [selectedPhotos, showsPerPhoto, cpm]);

  useEffect(() => {
    if (
      sku &&
      !sku.isOnAb &&
      !sku.hasAutoAd &&
      !sku.hasAucAd &&
      !sku.isOnDrain &&
      !sku.isOnHold
    ) {
      setValidSku(true);
    } else {
      setValidSku(false);
    }
  }, [sku]);

  useEffect(() => {
    setCpm(minCPM);
  }, [minCPM]);

  useEffect(() => {
    const available = accounts.find((acc) => acc.value >= calculatedBudget);
    if (available) setAccountType(available.key);
    else setAccountType(null);
  }, [calculatedBudget]);

  const handleClickOnSearch = (e) => {
    dispatch(resetFinalResultSettings());
    dispatch(resetIntermediateStatusCreating());
    dispatch(resetIntermediateStatusSettings());
    dispatch(resetFinalResultCreating());
    if (skuToFind.length !== 0) {
      const chosenSKU = skuList.filter((sku) => {
        let vcNameMatch = false;
        if (isNaN(skuToFind)) {
          vcNameMatch =
            sku.vendorcode.toLowerCase() === skuToFind.toLowerCase();
        } else {
          vcNameMatch = sku.sku === skuToFind;
        }
        if (vcNameMatch) {
          return vcNameMatch;
        }
      });
      if (chosenSKU[0]) {
        setSku(chosenSKU[0]);
        setSelectedPhotos([]);
      } else {
        dispatch(setError('Артикул не найден!'));
      }
    } else {
      dispatch(setError('Введите SKU или название артикула!'));
    }
  };

  const handleClickOnGoToSettings = (e) => {
    dispatch(getImagesAndSettings(`${hostName}/ab_tests/settings/${sku.sku}`));
  };

  const handleClickOnStartTest = (e) => {
    const data = {
      sku: sku.sku,
      selected_photos: selectedPhotos,
      calculated_budget: calculatedBudget,
      cpm: cpm,
      shows_per_photo: showsPerPhoto,
      balance_type: accountType,
    };
    console.log(data);
    dispatch(
      startTest({
        url: `${hostName}/ab_tests/create`,
        data: data,
      })
    );
    dispatch(fetchSkuList(`${hostName}/ab_tests/sku_list_for_ab`));
  };

  return (
    <section>
      <h1>Создание нового A/B теста</h1>
      <div className={styles.stepOneContainer}>
        <div className={styles.stepOneSearchBox}>
          <h2>Выбор артикула</h2>
          <div className={styles.stepOneSearchInputBox}>
            <input
              value={skuToFind}
              onChange={handleVCNameChange}
              type="text"
              placeholder="Введите название артикула или его SKU..."
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleClickOnSearch();
                }
              }}
            />
            <IoSearch
              className={styles.searchIcon}
              onClick={handleClickOnSearch}
            />
          </div>
        </div>
        <AnimatePresence>
          {sku && !finalSettings && steps.length === 0 && (
            <motion.div
              className={styles.stepOneSkuBox}
              initial={{ marginTop: -70, opacity: 0 }}
              animate={{ marginTop: 20, opacity: 1 }}
              exit={{ marginTop: -70, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <h2>Информация по артикулу</h2>
              <div className={styles.stepOneSkuInfoContainer}>
                <div className={styles.stepOneSkuInfo}>
                  <div className={styles.infoRow}>
                    <div className={styles.labelSKU}>Арт</div>
                    <div>{sku.vendorcode}</div>
                  </div>
                  <div className={styles.infoRow}>
                    <div className={styles.labelSKU}>SKU</div>
                    <div>{sku.sku}</div>
                  </div>
                  <div>
                    {sku.isOnAb ? (
                      <div className={styles.infoRow}>
                        <div className={styles.labelBad}>
                          <MdOutlineError />
                        </div>
                        <div>Есть активный A/B-тест</div>
                      </div>
                    ) : (
                      <div className={styles.infoRow}>
                        <div className={styles.labelGood}>
                          <IoIosCheckmarkCircle />
                        </div>
                        <div>Нет активных A/B-тестов</div>
                      </div>
                    )}
                  </div>
                  <div>
                    {sku.hasAutoAd ? (
                      <div className={styles.infoRow}>
                        <div className={styles.labelBad}>
                          <MdOutlineError />
                        </div>
                        <div>Есть активная АРК</div>
                      </div>
                    ) : (
                      <div className={styles.infoRow}>
                        <div className={styles.labelGood}>
                          <IoIosCheckmarkCircle />
                        </div>
                        <div>Нет активных AРК</div>
                      </div>
                    )}
                  </div>
                  <div>
                    {sku.hasAucAd ? (
                      <div className={styles.infoRow}>
                        <div className={styles.labelBad}>
                          <MdOutlineError />
                        </div>
                        <div>Есть активный аукцион</div>
                      </div>
                    ) : (
                      <div className={styles.infoRow}>
                        <div className={styles.labelGood}>
                          <IoIosCheckmarkCircle />
                        </div>
                        <div>Нет активных аукционов</div>
                      </div>
                    )}
                  </div>
                  <div>
                    {sku.isOnDrain ? (
                      <div className={styles.infoRow}>
                        <div className={styles.labelBad}>
                          <MdOutlineError />
                        </div>
                        <div>Товар на ликвидации</div>
                      </div>
                    ) : (
                      <div className={styles.infoRow}>
                        <div className={styles.labelGood}>
                          <IoIosCheckmarkCircle />
                        </div>
                        <div>Товар не на ликвидации</div>
                      </div>
                    )}
                  </div>
                  <div>
                    {sku.isOnHold ? (
                      <div className={styles.infoRow}>
                        <div className={styles.labelBad}>
                          <MdOutlineError />
                        </div>
                        <div>Товар на удержании</div>
                      </div>
                    ) : (
                      <div className={styles.infoRow}>
                        <div className={styles.labelGood}>
                          <IoIosCheckmarkCircle />
                        </div>
                        <div>Товар не на удержании</div>
                      </div>
                    )}
                  </div>
                </div>
                <div className={styles.stepOneImage}>
                  <img
                    src={sku.image}
                    alt="Photo"
                    style={{
                      maxHeight: '200px',
                      minHeight: '200px',
                      borderRadius: '0.5rem',
                      maxWidth: '150px',
                    }}
                  />
                </div>
              </div>
              <div className={styles.boxGoToSettings}>
                {validSku ? (
                  <button
                    onClick={handleClickOnGoToSettings}
                    className={styles.btnGoToSettings}
                  >
                    <div>
                      <IoMdSettings />
                    </div>
                    <div>Перейти к настройкам теста</div>
                  </button>
                ) : (
                  <div className={styles.testImpossible}>
                    Запуск теста невозможен
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {!finalSettings && steps.length > 0 && (
            <motion.div
              className={styles.stepOneStatusContainer}
              initial={{ marginTop: -100, opacity: 0 }}
              animate={{ marginTop: 10, opacity: 1 }}
              exit={{ marginTop: -100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <h2>Статус обработки:</h2>
              <div className={styles.stepOneStatusBox}>
                {steps.map((step, i) => (
                  <div key={i} className={styles.infoRow}>
                    {step.state === 'loading' && (
                      <div className={styles.spinner}></div>
                    )}
                    {step.state === 'success' && (
                      <IoIosCheckmarkCircle
                        color="green"
                        className={styles.statusMark}
                      />
                    )}
                    {step.state === 'error' && (
                      <MdOutlineError
                        color="red"
                        className={styles.statusMark}
                      />
                    )}
                    <div>{step.message}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {!finalResult && finalSettings && stepsCreating.length === 0 && (
            <motion.div
              className={styles.stepTwoSkuBox}
              initial={{ marginTop: -100, opacity: 0 }}
              animate={{ marginTop: 10, opacity: 1 }}
              exit={{ marginTop: -100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <h2>Настройки теста</h2>

              <div className={styles.photosBox}>
                <MdOutlineArrowBackIos
                  onClick={() => scrollCarousel('left')}
                  style={{ cursor: 'pointer' }}
                />
                <div ref={photosContainerRef} className={styles.photosCarousel}>
                  {finalSettings.photos.map((url) => (
                    <div
                      className={styles.photoFrame}
                      key={url}
                      onClick={() => togglePhoto(url)}
                      style={
                        selectedPhotos.includes(url)
                          ? {
                              backgroundImage: `linear-gradient(rgba(93, 50, 212, 0.2), rgba(93, 50, 212, 0.2)), url(${url})`,
                            }
                          : { backgroundImage: `url(${url})` }
                      }
                    >
                      {selectedPhotos.includes(url) && (
                        <IoIosCheckmarkCircle className={styles.photoMark} />
                      )}
                    </div>
                  ))}
                </div>
                <MdOutlineArrowForwardIos
                  onClick={() => scrollCarousel('right')}
                  style={{ cursor: 'pointer' }}
                />
              </div>
              <div className={styles.chosenPhotoNum}>
                Выбрано фото: {selectedPhotos.length}
              </div>
              <div className={styles.settingsGrid}>
                <label className={styles.labelInput}>
                  Показов на одно фото:
                </label>
                <input
                  type="number"
                  min={1000}
                  max={5000}
                  step={100}
                  value={showsPerPhoto}
                  onChange={(e) =>
                    setShowsPerPhoto(
                      Number(e.target.value) > 5000
                        ? 5000
                        : Number(e.target.value)
                    )
                  }
                  style={
                    showsPerPhoto < 1000
                      ? { boxShadow: '0px 0px 5px rgb(255, 0, 0)' }
                      : {}
                  }
                  className={styles.numInput}
                />
                <input
                  type="range"
                  min={1000}
                  max={5000}
                  step={100}
                  value={showsPerPhoto}
                  onChange={(e) => setShowsPerPhoto(Number(e.target.value))}
                  className={styles.scrollInput}
                />
                <label className={styles.labelInput}>CPM:</label>
                <input
                  type="number"
                  min={minCPM}
                  max={10 * minCPM}
                  value={cpm}
                  onChange={(e) =>
                    setCpm(
                      Number(e.target.value) > 10 * minCPM
                        ? 10 * minCPM
                        : Number(e.target.value)
                    )
                  }
                  className={styles.numInput}
                  style={
                    cpm < minCPM
                      ? { boxShadow: '0px 0px 5px rgb(255, 0, 0)' }
                      : {}
                  }
                />
                <input
                  type="range"
                  min={minCPM}
                  max={10 * minCPM}
                  step={5}
                  value={cpm < minCPM ? minCPM : cpm}
                  onChange={(e) => setCpm(Number(e.target.value))}
                  className={styles.scrollInput}
                />
                <label className={styles.labelInput}>Затраты на тест:</label>
                <div className={styles.cmpgnBudget}>
                  <AnimatedNumber
                    value={calculatedBudget ? calculatedBudget : 0}
                  />{' '}
                  {'  ₽'}
                </div>
              </div>

              <div className={styles.settingsGridBalance}>
                <label className={styles.labelInput}>Cчёт списания:</label>
                <div className={styles.balanceType}>
                  {accounts.map((acc) => {
                    const disabled = acc.value < calculatedBudget;
                    return (
                      <button
                        key={acc.key}
                        disabled={disabled}
                        onClick={() => !disabled && setAccountType(acc.key)}
                        style={{
                          background:
                            accountType === acc.key
                              ? 'rgba(130, 84, 255, 1)'
                              : disabled
                              ? 'rgb(234, 234, 234)'
                              : '#ccc',
                          color:
                            accountType === acc.key
                              ? 'white'
                              : disabled
                              ? 'gray'
                              : 'black',
                          cursor: disabled ? 'not-allowed' : 'pointer',
                        }}
                      >
                        <div className={styles.balanceName}>{acc.label}</div>
                        <div className={styles.balanceAmount}>
                          ({acc.value.toLocaleString()}
                          {'  ₽'})
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div style={{ marginTop: 20 }}>
                <button
                  disabled={
                    selectedPhotos.length <= 1 ||
                    !accountType ||
                    cpm < minCPM ||
                    showsPerPhoto < 1000
                  }
                  className={
                    selectedPhotos.length <= 1 || !accountType || cpm < minCPM
                      ? styles.startButton
                      : styles.readyStartButton
                  }
                  onClick={handleClickOnStartTest}
                >
                  <FaCirclePlay />
                  Запустить тест
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {!finalResult && stepsCreating.length > 0 && (
            <motion.div
              className={styles.stepOneStatusContainer}
              initial={{ marginTop: -100, opacity: 0 }}
              animate={{ marginTop: 10, opacity: 1 }}
              exit={{ marginTop: -100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <h2>Статус обработки:</h2>
              <div className={styles.stepOneStatusBox}>
                {stepsCreating.map((step, i) => (
                  <div key={i} className={styles.infoRow}>
                    {step.state === 'loading' && (
                      <div className={styles.spinner}></div>
                    )}
                    {step.state === 'success' && (
                      <IoIosCheckmarkCircle
                        color="green"
                        className={styles.statusMark}
                      />
                    )}
                    {step.state === 'error' && (
                      <MdOutlineError
                        color="red"
                        className={styles.statusMark}
                      />
                    )}
                    <div>{step.message}</div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {finalResult && (
            <motion.div
              className={styles.stepOneStatusContainer}
              initial={{ marginTop: -100, opacity: 0 }}
              animate={{ marginTop: 10, opacity: 1 }}
              exit={{ marginTop: -100, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            >
              <h2>Статус обработки:</h2>
              <div className={styles.stepOneStatusBox}>
                <IoIosCheckmarkCircle className={styles.testStartedMark} />
                <div className={styles.testStartedText}>
                  Тест успешно запущен
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </section>
  );
};

export default AbTestCreate;
