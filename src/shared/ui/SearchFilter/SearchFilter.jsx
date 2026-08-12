import { useState } from 'react';
import styles from './SearchFilter.module.css';

/**
 * Универсальный фильтр-поисковая строка с лупой.
 *
 * Поиск запускается только по Enter или по клику на лупу —
 * по мере ввода ничего не фильтруется. Пустой запуск (Enter по пустой
 * строке) означает «сбросить поиск».
 *
 * @param {object} props
 * @param {string} [props.placeholder='Поиск…'] — текст-заглушка
 * @param {(query: string) => void} props.onSearch — вызов с введённым запросом
 * @param {boolean} [props.disabled=false] — блокирует ввод и запуск поиска
 */
const SearchFilter = ({
  placeholder = 'Поиск…',
  onSearch,
  disabled = false,
}) => {
  const [value, setValue] = useState('');

  const submit = () => onSearch?.(value.trim());

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') submit();
  };

  return (
    <div className={styles.root}>
      <input
        type="text"
        className={styles.input}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={handleKeyDown}
        placeholder={placeholder}
        disabled={disabled}
      />
      <button
        type="button"
        className={styles.submit}
        onClick={submit}
        aria-label="Найти"
        title="Найти"
        disabled={disabled}
      >
        <svg
          width="14"
          height="14"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="11" cy="11" r="7" />
          <line x1="16.5" y1="16.5" x2="21" y2="21" />
        </svg>
      </button>
    </div>
  );
};

export default SearchFilter;
