import styles from './AbcHeatmap.module.css';

/** Уровни ABC снизу вверх: NEW — самый низкий, AAA — самый высокий. */
const LEVELS = ['NEW', 'C', 'B', 'A', 'AAA'];

/** Преобразует дату YYYY-MM-DD в DD.MM. */
const fmtDate = (date) => {
  if (/^\d{4}-\d{2}-\d{2}/.test(date)) {
    return `${date.slice(8, 10)}.${date.slice(5, 7)}`;
  }
  return date;
};

/**
 * Тепловая карта ABC по дням (чистые div-ы, без библиотек):
 * колонка — дата, строка — уровень ABC. Для каждой даты закрашивается
 * только квадрат уровня, соответствующего значению ABC в этот день
 * (NEW внизу, AAA наверху); остальные ячейки дня пустые (фон карточки).
 *
 * @param {object} props
 * @param {Record<string, string>} props.data — объект { дата: ABC-значение, … }
 * @param {number} [props.cellSize=16] — размер квадратика в пикселях
 */
const AbcHeatmap = ({ data = {}, cellSize = 16 }) => {
  const dates = Object.keys(data).sort();

  if (dates.length === 0) {
    return <div className={styles.noData}>Нет данных</div>;
  }

  // Сверху вниз (первый ребёнок flex-колонки — верхняя ячейка).
  const displayLevels = [...LEVELS].reverse();

  const styleVars = {
    '--cell-size': `${cellSize}px`,
    '--cell-width': `${cellSize + 2}px`,
  };

  return (
    <div className={styles.root} style={styleVars}>
      <div className={styles.scroll}>
        <div className={styles.body}>
          <div className={styles.axis}>
            {displayLevels.map((level) => (
              <span key={level} className={styles.levelLabel}>
                {level}
              </span>
            ))}
          </div>
          <div className={styles.days}>
            {dates.map((date) => {
              const raw = data[date];
              const abc = typeof raw === 'string' ? raw.trim().toUpperCase() : '';
              return (
                <div key={date} className={styles.day}>
                  <div className={styles.cellColumn}>
                    {displayLevels.map((level) => {
                      const active = abc === level;
                      return (
                        <span
                          key={level}
                          className={`${styles.cell} ${
                            active
                              ? styles[`cell_${level.toLowerCase()}`]
                              : styles.cellEmpty
                          }`}
                        />
                      );
                    })}
                  </div>
                  <span className={styles.dateLabel}>{fmtDate(date)}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AbcHeatmap;