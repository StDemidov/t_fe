/**
 * Шаблон для новой фичи. Скопируйте папку _template и переименуйте.
 *
 * Рекомендуемый flow:
 * 1. pages/MyFeaturePage/          — тонкая страница (route entry)
 * 2. widgets/MyFeature/            — крупные блоки UI
 * 3. features/my-feature/          — действия пользователя (формы, модалки)
 * 4. entities/my-entity/           — сущность + slice + api normalize
 */
import '../../../app/styles/global.css';
import styles from './NewFeaturePage.module.css';

const NewFeaturePage = () => {
  return (
    <div className={`page ${styles.root}`}>
      <header className="pageHeader">
        <h1 className="pageTitle">New Feature</h1>
      </header>
      <div className="card">Контент новой фичи</div>
    </div>
  );
};

export default NewFeaturePage;
