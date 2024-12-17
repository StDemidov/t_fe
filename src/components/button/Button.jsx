import styles from './style.module.css';

const Button = ({ onClick, text }) => {
  return (
    <button className={styles.buttonStyle} onClick={onClick}>
      {text}
    </button>
  );
};

export default Buttoddn;
