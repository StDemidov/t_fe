import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';

import { setError } from '../../redux/slices/errorSlice';
import { login, selectUser } from '../../redux/slices/authSlice';

import styles from './style.module.css';
import { hostName } from '../../utils/host';

const LoginPage = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const currentUser = useSelector(selectUser);
  const dispatch = useDispatch();
  const navigation = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (username !== '' && password !== '') {
      const data = {
        username: username,
        password: password,
      };
      dispatch(
        login({
          data: data,
          url: `${hostName}/user/login/`,
        })
      );
    } else {
      dispatch(setError('Заполните логин и пароль!'));
    }
  };

  useEffect(() => {
    if (currentUser.username) {
      navigation('/vendorcodes');
    }
  });

  return (
    <section className={styles.loginSection}>
      <form className={styles.formMain} onSubmit={handleSubmit}>
        <p className={styles.formTitle}>Войти в аккаунт</p>
        <div className={styles.inputContainer}>
          <input
            type="text"
            placeholder="Введите имя пользователя"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
          />
        </div>
        <div className={styles.inputContainer}>
          <input
            type="password"
            placeholder="Введите пароль"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <button className={styles.submitButton} type="submit">
          Войти
        </button>
      </form>
    </section>
  );
};

export default LoginPage;
