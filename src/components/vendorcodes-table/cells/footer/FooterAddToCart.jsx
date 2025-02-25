import styles from './style.module.css';

const FooterAddToCart = ({ avgAddToCart }) => {
  return (
    <div className={styles.cell}>
      {avgAddToCart ? avgAddToCart.toLocaleString() : 0} %
    </div>
  );
};

export default FooterAddToCart;
