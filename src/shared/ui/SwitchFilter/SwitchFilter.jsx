import { useState } from 'react';
import styles from './SwitchFilter.module.css';

/**
 * Плашка-переключатель «да/нет» для фильтров.
 *
 * Фильтрация применяется сразу при нажатии (без кнопки «Применить»).
 * В состоянии true плашка фиолетовая, переключатель уезжает вправо;
 * в false — серая, переключатель слева.
 *
 * Управление: либо контролируемое через `checked` + `onChange`,
 * либо с дефолтным значением через `defaultChecked` (неконтролируемое).
 *
 * @param {object} props
 * @param {string} props.label — подпись фильтра
 * @param {boolean} [props.checked] — управляемое значение
 * @param {boolean} [props.defaultChecked=false] — значение по умолчанию (для неконтролируемого режима)
 * @param {(value: boolean) => void} [props.onChange] — вызов при переключении
 * @param {boolean} [props.disabled=false] — блокирует переключение
 */
const SwitchFilter = ({
  label,
  checked,
  defaultChecked = false,
  onChange,
  disabled = false,
}) => {
  const [inner, setInner] = useState(defaultChecked);
  const isOn = checked !== undefined ? checked : inner;

  const toggle = () => {
    const next = !isOn;
    if (checked === undefined) setInner(next);
    onChange?.(next);
  };

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isOn}
      className={`${styles.root} ${isOn ? styles.rootOn : ''}`}
      onClick={toggle}
      disabled={disabled}
    >
      <span className={styles.label}>{label}</span>
      <span className={`${styles.switch} ${isOn ? styles.switchOn : ''}`}>
        <span className={`${styles.knob} ${isOn ? styles.knobOn : ''}`} />
      </span>
    </button>
  );
};

export default SwitchFilter;
