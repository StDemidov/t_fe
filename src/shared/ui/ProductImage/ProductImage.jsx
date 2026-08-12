import { useState } from 'react';
import { IoLinkOutline } from 'react-icons/io5';
import styles from './ProductImage.module.css';

/**
 * Лениво загружаемая картинка товара.
 * Поверх фотки: плашки ABC (общая и по категории) и полоска SKU внизу —
 * по клику копирует sku (текст на секунду сменяется на «Скопировано»),
 * рядом иконка-ссылка на страницу vendorcode (открывает новую вкладку).
 * @param {object} props
 * @param {string} props.src — полный URL картинки
 * @param {string} props.alt — текст (vendorcode)
 * @param {number} [props.size] — размер миниатюры в пикселях (иначе заполняет колонку)
 * @param {string} [props.abc] — ABC-категория товара
 * @param {string} [props.abcInCategory] — ABC-категория товара внутри категории
 * @param {string} [props.sku] — артикул товара (копируется по клику)
 * @param {number} [props.skuId] — id товара для ссылки на vendorcode
 * @param {boolean} [props.noStock] — товар с нулевыми остатками: поверх фото красная заливка
 * @param {number} [props.refreshToken] — смена токена пересоздаёт <img> и повторяет загрузку
 */
const ProductImage = ({
  src,
  alt,
  size,
  abc,
  abcInCategory,
  sku,
  skuId,
  noStock,
  refreshToken = 0,
}) => {
  const [copied, setCopied] = useState(false);
  const sizeStyle = size ? { width: size, height: size } : {};

  const handleCopy = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const text = String(sku);
    try {
      await navigator.clipboard.writeText(text);
    } catch (err) {
      const ta = document.createElement('textarea');
      ta.value = text;
      ta.style.position = 'fixed';
      ta.style.opacity = '0';
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    setCopied(true);
    setTimeout(() => setCopied(false), 1000);
  };

  return (
    <div className={styles.wrapper} style={sizeStyle}>
      <img
        key={refreshToken}
        src={src}
        alt={alt}
        title={alt}
        loading="lazy"
        decoding="async"
        className={styles.image}
        onError={(e) => {
          e.currentTarget.style.visibility = 'hidden';
        }}
      />
      {noStock && <span className={styles.noStockOverlay} />}
      {abc ? (
        <span
          className={`${styles.abcBadge} ${styles[`abc_${abc.toLowerCase()}`] || ''}`}
        >
          {abc}
        </span>
      ) : null}
      {abcInCategory ? (
        <span
          className={`${styles.abcBadge} ${styles.abcRight} ${styles[`abc_${abcInCategory.toLowerCase()}`] || ''}`}
        >
          {abcInCategory}
        </span>
      ) : null}
      <div
        className={styles.skuStrip}
        onClick={handleCopy}
        title="Скопировать SKU"
        data-interactive="true"
      >
        <div className={styles.skuText}>
          <div
            className={`${styles.skuSlide} ${copied ? styles.skuSlideCopied : ''}`}
          >
            <span className={styles.skuSlideItem}>{sku}</span>
            <span className={styles.skuSlideItem}>Скопировано</span>
          </div>
        </div>
        <a
          className={styles.skuLink}
          href={`/vendorcodes/${skuId}`}
          onClick={(e) => e.stopPropagation()}
          title="Открыть vendorcode"
          target="_blank"
          rel="noopener noreferrer"
        >
          <IoLinkOutline />
        </a>
      </div>
    </div>
  );
};

export default ProductImage;
