import { NavLink } from 'react-router-dom';
import { MdLogout } from 'react-icons/md';
import { useDispatch, useSelector } from 'react-redux';

import { clearCredentials, selectUser } from '../../redux/slices/authSlice';
import styles from './style.module.css';

const Menu = () => {
  const dispatch = useDispatch();
  const currentUser = useSelector(selectUser);

  const handleLogout = (e) => {
    dispatch(clearCredentials());
  };
  return (
    <nav className={styles.navMenu}>
      <ul className={styles.menuItems}>
        <li>
          <NavLink className={styles.navLink} to="." end content="Главная">
            Главная
          </NavLink>
        </li>
        {(currentUser.permissions.vendorcodes ||
          currentUser.permissions.is_admin) && (
          <li>
            <NavLink
              className={styles.navLink}
              to="vendorcodes"
              content="Товары"
            >
              Товары
            </NavLink>
          </li>
        )}
        {(currentUser.permissions.category_metrics ||
          currentUser.permissions.is_admin) && (
          <li>
            <NavLink
              className={styles.navLink}
              to="categories"
              content="Категории"
            >
              Категории
            </NavLink>
          </li>
        )}
        {(currentUser.permissions.barcodes_predicts ||
          currentUser.permissions.is_admin) && (
          <li>
            <NavLink className={styles.navLink} to="barcodes" content="Баркоды">
              Баркоды
            </NavLink>
          </li>
        )}
        {(currentUser.permissions.prints_base_view ||
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
        )}
        <li>
          <NavLink className={styles.navLink} to="tools" content="Инструменты">
            Инструменты
          </NavLink>
        </li>
        <li className={styles.logoutBlock}></li>
      </ul>
      <button className={styles.logoutButton} onClick={handleLogout}>
        <MdLogout />
      </button>
    </nav>
  );
};

export default Menu;
