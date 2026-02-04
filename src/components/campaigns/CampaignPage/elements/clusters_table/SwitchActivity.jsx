import styles from './style.module.css';

const SwitchActivity = ({ checked, onChange }) => {
  return (
    <button
      type="button"
      className={`${styles.switch} ${checked ? styles.on : ''}`}
      onClick={() => onChange(!checked)}
      aria-pressed={checked}
    >
      <span className={styles.slider} />
    </button>
  );
};

export default SwitchActivity;
