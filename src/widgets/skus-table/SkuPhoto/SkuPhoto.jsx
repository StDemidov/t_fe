import { FaStar } from 'react-icons/fa';
import styles from './SkuPhoto.module.css';

/**
 * Портретное фото товара (3:4).
 *
 * Поверх фото, в верхнем правом углу — чёрная плашка рейтинга: звезда
 * и оценка (1 знак после запятой); если рейтинга нет — «?».
 *
 * @param {object} props
 * @param {string} props.src — полный URL фото
 * @param {string} props.alt — текст (артикул)
 * @param {number|null} [props.rating] — рейтинг товара
 */
const SkuPhoto = ({ src, alt, rating = null }) => {
  const ratingText =
    typeof rating === 'number' && Number.isFinite(rating)
      ? rating.toFixed(1)
      : '?';
  return (
    <div className={styles.wrapper}>
      <img className={styles.image} src={src} alt={alt} title={alt} loading="lazy" />
      <span className={styles.rating}>
        <FaStar className={styles.ratingStar} />
        <span className={styles.ratingValue}>{ratingText}</span>
      </span>
    </div>
  );
};

export default SkuPhoto;
