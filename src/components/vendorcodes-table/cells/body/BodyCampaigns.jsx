import styles from './style.module.css';

const BodyCampaigns = ({ vc }) => {
  return (
    <div className={styles.cell}>
      <div className={styles.campaignsStatuses}>
        <div
          className={`${styles.campaignDiv} ${
            vc.advCampaigns.unified.is_exist
              ? vc.advCampaigns.unified.is_active
                ? styles.campaignIsActive
                : styles.campaignIsPaused
              : styles.campaignNotExist
          }`}
        >
          АВТО
        </div>
        <div
          className={`${styles.campaignDiv} ${
            vc.advCampaigns.manual.is_exist
              ? vc.advCampaigns.manual.is_active
                ? styles.campaignIsActive
                : styles.campaignIsPaused
              : styles.campaignNotExist
          }`}
        >
          АУК
        </div>
      </div>
    </div>
  );
};

export default BodyCampaigns;
