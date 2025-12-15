import styles from './style.module.css';

const CampaignsCreateSummary = ({ settings, currentStep }) => {
  return (
    <div className={styles.summaryBox}>
      <div>
        {settings.bidType}
        {currentStep}
      </div>
      <div>
        {settings.skuList.length === 0 ? (
          <>Добавьте артикулы</>
        ) : (
          settings.skuList.map((item) => (
            <div key={item.sku}>
              {item.sku}{' '}
              {item.manualCampActive >= 0
                ? 'С остановкой кампании с ручной ставкой'
                : item.unifiedCampActive >= 0
                ? 'С остановкой кампании с единой ставкой'
                : 'Не завершенных кампаний нет'}
            </div>
          ))
        )}
      </div>
      <div>
        {!settings.settings ? (
          <>Установите настройки кампаний</>
        ) : (
          <div className={styles.validationInfo}>
            <h3>Проверка условий:</h3>
            <ul>
              <li
                className={
                  settings.settings.ctrBench > 0 ? styles.valid : styles.invalid
                }
              >
                CTR больше нуля: {settings.settings.ctrBench > 0 ? '✓' : '✗'}
              </li>
              <li
                className={
                  settings.settings.viewsBench > 0
                    ? styles.valid
                    : styles.invalid
                }
              >
                Просмотры больше нуля:{' '}
                {settings.settings.viewsBench > 0 ? '✓' : '✗'}
              </li>
              <li
                className={
                  settings.settings.searchPlacement ||
                  settings.settings.recPlacement
                    ? styles.valid
                    : styles.invalid
                }
              >
                Выбрано место размещения:{' '}
                {settings.settings.searchPlacement ||
                settings.settings.recPlacement
                  ? '✓'
                  : '✗'}
              </li>
              <li
                className={
                  (!settings.settings.searchPlacement ||
                    (settings.settings.searchPlacement &&
                      settings.settings.searchBid > 0)) &&
                  (!settings.settings.recPlacement ||
                    (settings.settings.recPlacement &&
                      settings.settings.recBid > 0))
                    ? styles.valid
                    : styles.invalid
                }
              >
                Ставки соответствуют выбору:{' '}
                {(!settings.settings.searchPlacement ||
                  (settings.settings.searchPlacement &&
                    settings.settings.searchBid > 0)) &&
                (!settings.settings.recPlacement ||
                  (settings.settings.recPlacement &&
                    settings.settings.recBid > 0))
                  ? '✓'
                  : '✗'}
              </li>
              <li
                className={
                  settings.skuList && settings.skuList.length > 0
                    ? styles.valid
                    : styles.invalid
                }
              >
                Выбраны артикулы:{' '}
                {settings.skuList && settings.skuList.length > 0 ? '✓' : '✗'} (
                {settings.skuList?.length || 0})
              </li>
              <li
                className={
                  settings.settings.lowerTurnoverThreshold >= 0
                    ? styles.valid
                    : styles.invalid
                }
              >
                Порог оборачиваемости ≥ 0:{' '}
                {settings.settings.lowerTurnoverThreshold >= 0 ? '✓' : '✗'}
              </li>
              <li
                className={
                  !settings.settings.hasActiveHours ||
                  (settings.settings.hasActiveHours &&
                    settings.settings.startHour !== settings.settings.pauseHour)
                    ? styles.valid
                    : styles.invalid
                }
              >
                Часы активности валидны:{' '}
                {!settings.settings.hasActiveHours ||
                (settings.settings.hasActiveHours &&
                  settings.settings.startHour !== settings.settings.pauseHour)
                  ? '✓'
                  : '✗'}
              </li>
              <li
                className={
                  settings.settings.turnoverDays > 0
                    ? styles.valid
                    : styles.invalid
                }
              >
                Дни оборачиваемости {'>'} 0:{' '}
                {settings.settings.turnoverDays > 0 ? '✓' : '✗'}
              </li>
              <li
                className={
                  settings.settings.currBudget >= 2000 &&
                  settings.settings.currBudget % 100 === 0
                    ? styles.valid
                    : styles.invalid
                }
              >
                Бюджет ≥ 2000 и кратен 100:{' '}
                {settings.settings.currBudget >= 2000 &&
                settings.settings.currBudget % 100 === 0
                  ? '✓'
                  : '✗'}
              </li>
              <li
                className={
                  settings.settings.budgetFloor >= 1000 &&
                  settings.settings.budgetFloor % 100 === 0
                    ? styles.valid
                    : styles.invalid
                }
              >
                Порог пополнения ≥ 1000 и кратен 100:{' '}
                {settings.settings.budgetFloor >= 1000 &&
                settings.settings.budgetFloor % 100 === 0
                  ? '✓'
                  : '✗'}
              </li>
              <li
                className={
                  settings.settings.replinishmentAmount >= 1000 &&
                  settings.settings.replinishmentAmount % 100 === 0
                    ? styles.valid
                    : styles.invalid
                }
              >
                Сумма пополнения ≥ 1000 и кратен 100:{' '}
                {settings.settings.replinishmentAmount >= 1000 &&
                settings.settings.replinishmentAmount % 100 === 0
                  ? '✓'
                  : '✗'}
              </li>
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default CampaignsCreateSummary;
