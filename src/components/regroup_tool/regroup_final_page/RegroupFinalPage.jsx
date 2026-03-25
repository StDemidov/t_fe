import { useDispatch, useSelector } from 'react-redux';
import {
  returnToStart,
  selectAllItems,
  selectFailedGroups,
  selectGroupsUpdateError,
} from '../../../redux/slices/regroupSlice';
import styles from './style.module.css';

const RegroupFinalPage = () => {
  const groupsUpdateError = useSelector(selectGroupsUpdateError);
  const allItems = useSelector(selectAllItems);
  const failedGroups = useSelector(selectFailedGroups);

  const dispatch = useDispatch();

  const handleClickOnReturn = () => {
    dispatch(returnToStart());
  };

  // Создаем маппинг sku -> item для быстрого доступа
  const itemsMap = allItems.reduce((acc, item) => {
    acc[item.sku] = item;
    return acc;
  }, {});

  // Если нет ошибок - показываем успешную плашку
  if (!groupsUpdateError && failedGroups.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.successCard}>
          <div className={styles.successIcon}>✓</div>
          <h2 className={styles.successTitle}>Все товары успешно обновлены!</h2>
          <p className={styles.successMessage}>
            Обновление групп прошло без ошибок
          </p>
          <button onClick={handleClickOnReturn} className={styles.returnButton}>
            Вернуться в начало
          </button>
        </div>
      </div>
    );
  }

  // Если есть ошибки - показываем карточки с ошибками
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <button onClick={handleClickOnReturn} className={styles.returnButton}>
          Вернуться в начало
        </button>
      </div>
      <div className={styles.gridContainer}>
        <div className={styles.cardsGrid}>
          {failedGroups.map((failedGroup, index) => {
            // Получаем все товары из этой группы ошибок
            const itemsInGroup = failedGroup.group
              .map((sku) => itemsMap[sku])
              .filter((item) => item); // фильтруем undefined на случай, если товар не найден

            return (
              <div key={index} className={styles.card}>
                <div className={styles.cardContent}>
                  {/* Горизонтальный скролл с фотками */}
                  <div className={styles.imagesScrollContainer}>
                    <div className={styles.imagesWrapper}>
                      {itemsInGroup.map((item, itemIndex) => (
                        <div
                          key={`${item.sku}-${itemIndex}`}
                          className={styles.imageCard}
                        >
                          <div className={styles.imageWrapper}>
                            <img
                              src={item.image}
                              alt={item.vendorCode}
                              className={styles.productImage}
                            />
                            {/* Бегущая строка с артикулом */}
                            <div className={styles.vendorCodeContainer}>
                              <div className={styles.vendorCode}>
                                {item.vendorCode || ''}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Текст ошибки */}
                  <div className={styles.errorDescription}>
                    {/* <span className={styles.errorLabel}>Ошибка:</span> */}
                    <span className={styles.errorText}>
                      {failedGroup.error_description}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default RegroupFinalPage;
