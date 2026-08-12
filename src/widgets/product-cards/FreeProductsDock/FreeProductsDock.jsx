import { memo, useState } from 'react';
import { MdOutlineMoreVert } from 'react-icons/md';
import { ProductImage } from '../../../shared/ui';
import SkuStatsBlock from '../SkuStatsBlock';
import styles from './FreeProductsDock.module.css';

const IMAGE_SIZE = 74;

/**
 * Блок «свободных товаров» (группа id = -1) на холсте.
 * Каждая ABC-категория — отдельный ряд, всё отрисовывается сразу (без скролла).
 * Кнопка в шапке раскрывает статистику каждого артикула (тот же блок, что
 * у карточек). На этапе 2 станет droppable-зоной для переноса товаров.
 * memo — чтобы пан/зум холста не перерисовывал содержимое.
 * @param {object} props
 * @param {Array<{ abc: string, skus: Array<object> }>} props.groups
 */
const FreeProductsDock = memo(function FreeProductsDock({ groups }) {
  const [expanded, setExpanded] = useState(false);
  const total = groups.reduce((sum, group) => sum + group.skus.length, 0);

  return (
    <div className={styles.root}>
      <header className={styles.header}>
        <span className={styles.title}>Свободные товары</span>
        <div className={styles.headerRight}>
          <span className={styles.count}>{total}</span>
          <button
            type="button"
            className={`${styles.moreButton} ${
              expanded ? styles.moreButtonActive : ''
            }`}
            onClick={() => setExpanded((value) => !value)}
            aria-expanded={expanded}
            aria-label="Статистика артикулов"
            title="Статистика артикулов"
          >
            <MdOutlineMoreVert size={18} />
          </button>
        </div>
      </header>
      {groups.map((group) => (
        <div key={group.abc} className={styles.abcRow}>
          <span className={styles.abcLabel}>
            {group.abc} · {group.skus.length}
          </span>
          <div className={styles.abcThumbs}>
            {group.skus.map((sku) => (
              <div className={styles.thumb} key={sku.sku}>
                <ProductImage
                  src={sku.image}
                  alt={sku.vendorcode}
                  abc={sku.abc}
                  abcInCategory={sku.abcInCategory}
                  sku={sku.sku}
                  skuId={sku.id}
                  noStock={sku.stocks === 0}
                  size={IMAGE_SIZE}
                />
                <SkuStatsBlock sku={sku} open={expanded} />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
});

export default FreeProductsDock;
