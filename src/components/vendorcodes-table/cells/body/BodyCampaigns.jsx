import { Link } from 'react-router-dom';
import styles from './style.module.css';

const BodyCampaigns = ({ vc }) => {
  return (
    <div className={styles.cell}>
      <div className={styles.campaignsStatuses}>
        {vc.advCampaigns.unified.id !== -1 ? (
          <Link
            to={`/tools/campaigns/${vc.advCampaigns.unified.id}`}
            className={`${styles.campaignDiv} ${styles.campaignLink} ${
              vc.advCampaigns.unified.is_exist
                ? vc.advCampaigns.unified.is_active
                  ? styles.campaignIsActive
                  : styles.campaignIsPaused
                : styles.campaignNotExist
            }`}
            style={{ textDecoration: 'none' }}
            target="_blank"
          >
            АВТО
          </Link>
        ) : (
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
        )}

        {vc.advCampaigns.manual.id !== -1 ? (
          <Link
            to={`/tools/campaigns/${vc.advCampaigns.manual.id}`}
            className={`${styles.campaignDiv} ${styles.campaignLink} ${
              vc.advCampaigns.manual.is_exist
                ? vc.advCampaigns.manual.is_active
                  ? styles.campaignIsActive
                  : styles.campaignIsPaused
                : styles.campaignNotExist
            }`}
            style={{ textDecoration: 'none' }}
            target="_blank"
          >
            АУК
          </Link>
        ) : (
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
        )}
      </div>
    </div>
  );
};

export default BodyCampaigns;
