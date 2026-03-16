import { TiArrowSortedUp } from 'react-icons/ti';
import { TiArrowSortedDown } from 'react-icons/ti';

import styles from './style.module.css';

const SortingButtons = ({
  ascSortingKey,
  descSortingKey,
  activeSorting,
  handler,
}) => {
  return (
    <div className={styles.sortingButtons}>
      <TiArrowSortedUp
        className={`${
          ascSortingKey === activeSorting
            ? styles.activeSorting
            : styles.inactiveSorting
        }`}
        data-value={ascSortingKey}
        onClick={handler}
      />
      <TiArrowSortedDown
        className={`${
          descSortingKey === activeSorting
            ? styles.activeSorting
            : styles.inactiveSorting
        }`}
        data-value={descSortingKey}
        onClick={handler}
      />
    </div>
  );
};

export default SortingButtons;
