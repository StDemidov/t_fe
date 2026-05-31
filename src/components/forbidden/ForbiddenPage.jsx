import styles from './ForbiddenPage.module.css';

export default function ForbiddenPage() {
  return (
    <div className={styles.container}>
      <span className={styles.code}>403</span>
      <span className={styles.message}>Нет доступа</span>
    </div>
  );
}
