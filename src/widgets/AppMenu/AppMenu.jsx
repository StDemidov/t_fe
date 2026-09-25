import { NavLink } from 'react-router-dom';
import { MdLogout } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';

import { clearCredentials, selectUser } from '../../redux/slices/authSlice';
import tishkaLogo from '../../shared/assets/tishka_logo.png';
import styles from './AppMenu.module.css';

/** Верхнее меню навигации с логотипом и кнопкой выхода. */
const AppMenu = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);

  const handleLogout = () => {
    dispatch(clearCredentials());
  };

  return (
    <nav className={styles.nav}>
      <ul className={styles.menuItems}>
        {/* <li>
          <NavLink className={styles.navLink} to="." end content="Главная">
            Главная
          </NavLink>
        </li> */}
        {(currentUser.permissions.vendorcodes ||
          currentUser.permissions.is_admin) && (
          <li className={styles.menuItem}>
            <NavLink className={styles.navLink} to="skus" content="Товары">
              Товары
            </NavLink>
          </li>
        )}
        {(currentUser.permissions.category_metrics ||
          currentUser.permissions.is_admin) && (
          <li className={styles.menuItem}>
            <NavLink
              className={styles.navLink}
              to="categories"
              content="Категории"
            >
              Категории
            </NavLink>
          </li>
        )}
        {/* {(currentUser.permissions.barcodes_predicts ||
          currentUser.permissions.is_admin) && (
          <li>
            <NavLink className={styles.navLink} to="barcodes" content="Баркоды">
              Баркоды
            </NavLink>
          </li>
        )} */}
        {/* {(currentUser.permissions.prints_base_view ||
          currentUser.permissions.is_admin) && (
          <li>
            <NavLink
              className={styles.navLink}
              to="prints"
              content="База принтов"
            >
              База принтов
            </NavLink>
          </li>
        )} */}
        {(currentUser.permissions.barcodes_predicts ||
          currentUser.permissions.is_admin) && (
          <li className={styles.menuItem}>
            <NavLink
              className={styles.navLink}
              to="/tools/orders_to_processors"
              content="Расчет дозаказов"
            >
              Расчет дозаказов
            </NavLink>
          </li>
        )}
        <li className={styles.menuItem}>
          <NavLink className={styles.navLink} to="tools" content="Инструменты">
            Инструменты
          </NavLink>
        </li>
      </ul>
      <div className={styles.actions}>
        <img className={styles.logo} src={tishkaLogo} alt="Tishka" />
        <button
          type="button"
          className={styles.logoutButton}
          title="Выйти"
          aria-label="Выйти"
          onClick={handleLogout}
        >
          <MdLogout />
        </button>
      </div>
    </nav>
  );
};

export default AppMenu;