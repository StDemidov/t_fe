import { useDispatch } from 'react-redux';
import {
  FaAngleLeft,
  FaAnglesLeft,
  FaAngleRight,
  FaAnglesRight,
} from 'react-icons/fa6';

import styles from './style.module.css';

const TablesPaginator = ({ currentPage, numOfPages, setPageFunction }) => {
  const dispatch = useDispatch();

  const handleClickOnNextPage = (event) => {
    if (currentPage !== numOfPages) {
      dispatch(setPageFunction(currentPage + 1));
    }
  };
  const handleClickOnPrevPage = (event) => {
    if (currentPage > 1) {
      dispatch(setPageFunction(currentPage - 1));
    }
  };
  const handleClickOnFirstPage = (event) => {
    if (currentPage > 1) {
      dispatch(setPageFunction(1));
    }
  };
  const handleClickOnLastPage = (event) => {
    if (currentPage !== numOfPages - 1) {
      dispatch(setPageFunction(numOfPages));
    }
  };

  return (
    <div className={styles.paginatorDefault}>
      <FaAnglesLeft
        className={`${
          currentPage > 1 ? styles.pageArrow : styles.disabledArrow
        }`}
        onClick={handleClickOnFirstPage}
      />
      <FaAngleLeft
        className={`${
          currentPage > 1 ? styles.pageArrow : styles.disabledArrow
        }`}
        onClick={handleClickOnPrevPage}
      />
      <div
        className={`${styles.pageIcon} ${styles.currentPage}`}
        data-value={currentPage}
        key={'page_' + currentPage}
      >
        Страница {currentPage} из {numOfPages}
      </div>
      <FaAngleRight
        className={`${
          currentPage !== numOfPages ? styles.pageArrow : styles.disabledArrow
        }`}
        onClick={handleClickOnNextPage}
      />
      <FaAnglesRight
        className={`${
          currentPage !== numOfPages ? styles.pageArrow : styles.disabledArrow
        }`}
        onClick={handleClickOnLastPage}
      />
    </div>
  );
};

export default TablesPaginator;
