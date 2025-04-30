import styles from './style.module.css';

const HeaderCampaigns = () => {
  return (
    <div className={styles.cell}>
      <abbr
        title={
          'Если тип кампании выделен КРАСНЫМ, то такого типа кампании для артикула нет, если горит ОРАНЖЕВЫМ, значит кампания данного типа на паузе, если она цвет ЗЕЛЕНЫЙ, значит кампания активна'
        }
      >
        Кампании
      </abbr>
    </div>
  );
};

export default HeaderCampaigns;
