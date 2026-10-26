import { BiSolidLike, BiSolidSearchAlt2 } from 'react-icons/bi';

import styles from './PromoTable.module.css';

/** Ставка в формате с разделителями тысяч; null, если значения нет. */
const formatBid = (value) => {
  if (value === null || value === undefined || value === '') return null;
  const num = Number(value);
  return Number.isFinite(num)
    ? new Intl.NumberFormat('ru-RU').format(num)
    : String(value);
};

/**
 * Ячейка колонки «Ставки»: значения в плашках, по центру ячейки.
 *
 * Единая кампания (bidType === 'unified'): одна плашка с любым значением
 * recBid/searchBid (они одинаковые). Ручная (manual): две плашки —
 * размещение в рекомендациях (иконка «лайк», recPlacement/recBid)
 * и в поиске (иконка-поиск, searchPlacement/searchBid). Иконка зелёная,
 * если размещение активно, и в плашке стоит ставка; красная — если нет,
 * вместо ставки прочерк.
 *
 * @param {object} props
 * @param {object} props.item — рекламная кампания
 */
const BidCell = ({ item }) => {
  if (item.bidType === 'unified') {
    const bid = formatBid(item.recBid ?? item.searchBid);
    return <span className={styles.bidBadge}>{bid ?? '—'}</span>;
  }

  if (item.bidType !== 'manual') {
    return <span className={styles.bidBadge}>—</span>;
  }

  const rec = formatBid(item.recBid);
  const search = formatBid(item.searchBid);

  return (
    <div className={styles.bidCell}>
      <span className={styles.bidBadge}>
        <span
          className={item.recPlacement ? styles.bidIconOn : styles.bidIconOff}
          title="Размещение в рекомендациях"
        >
          <BiSolidLike />
        </span>
        {item.recPlacement && rec ? rec : '—'}
      </span>
      <span className={styles.bidBadge}>
        <span
          className={
            item.searchPlacement ? styles.bidIconOn : styles.bidIconOff
          }
          title="Размещение в поиске"
        >
          <BiSolidSearchAlt2 />
        </span>
        {item.searchPlacement && search ? search : '—'}
      </span>
    </div>
  );
};

export default BidCell;
