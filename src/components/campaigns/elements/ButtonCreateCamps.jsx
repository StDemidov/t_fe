import { useNavigate } from 'react-router-dom';
import styles from './style.module.css';

const ButtonCreateCamps = () => {
  const navigation = useNavigate();

  const handleClickOnButton = (event) => {
    navigation(`/tools/campaigns/create`);
  };

  return (
    <button
      className={styles.buttonCreate}
      onClick={(e) => {
        handleClickOnButton(e);
      }}
    >
      Создать кампании
    </button>
  );
};

export default ButtonCreateCamps;
