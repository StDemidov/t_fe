import { v4 as uuidv4 } from 'uuid';
import styles from './style.module.css';

import ActiveHoursCell from './cells/ActiveHoursCell';
import BidsCell from './cells/BidsCell';
import BidTypeCell from './cells/BidTypeCell';
import ClicksCell from './cells/ClicksCell';
import CtrBenchCell from './cells/CtrBenchCell';
import CtrCell from './cells/CtrCell';
import SkuBaseCell from './cells/SkuBaseCell';
import SpendCell from './cells/SpendCell';
import StatusCell from './cells/StatusCell';
import TotalCtrCell from './cells/TotalCtrCell';
import TotalSpendCell from './cells/TotalSpendCell';
import TurnoverCell from './cells/TurnoverCell';
import ViewsCell from './cells/ViewsCell';
import ActionButtons from './cells/ActionButtons';

const CampaignsBody = ({ columns, campaigns, dates }) => {
  return (
    <div className={styles.tableBody}>
      {campaigns.map((camp) => {
        return (
          <div className={styles.campRow} key={camp.campId}>
            {columns.map((col) => {
              if (!col.hidden) {
                return bodyCellsRender[col.key](camp, col.cellStyle, dates);
              }
            })}
          </div>
        );
      })}
    </div>
  );
};

const bodyCellsRender = {
  skuBase: (camp, style) => (
    <SkuBaseCell
      image={camp.photo}
      sku={camp.sku}
      skuName={camp.skuName}
      creationDate={camp.creationDate}
      cellStyle={style}
    />
  ),
  status: (camp, style) => <StatusCell camp={camp} cellStyle={style} />,
  activeHours: (camp, style) => (
    <ActiveHoursCell
      hasActiveHours={camp.hasActiveHours}
      startHour={camp.startHour}
      pauseHour={camp.pauseHour}
      cellStyle={style}
    />
  ),
  bidType: (camp, style) => (
    <BidTypeCell bidType={camp.bidType} cellStyle={style} />
  ),
  bids: (camp, style) => <BidsCell camp={camp} cellStyle={style} />,
  ctrBench: (camp, style) => (
    <CtrBenchCell ctrBench={camp.ctrBench} cellStyle={style} />
  ),
  turnover: (camp, style) => (
    <TurnoverCell
      lowerTurnoverThreshold={camp.lowerTurnoverThreshold}
      turnoverDays={camp.turnoverDays}
      turnoverByBarcodes={camp.turnoverByBarcodes}
      cellStyle={style}
    />
  ),
  totalSpend: (camp, style) => (
    <TotalSpendCell
      totalSpend={camp.totalSpend}
      cellStyle={style}
      ended={camp.endDate === '' ? false : true}
    />
  ),
  totalCTR: (camp, style) => (
    <TotalCtrCell
      totalCtr={camp.totalCtr}
      cellStyle={style}
      ended={camp.endDate === '' ? false : true}
    />
  ),
  views: (camp, style, dates) => (
    <ViewsCell
      views={camp.views}
      dates={dates}
      cellStyle={style}
      ended={camp.endDate === '' ? false : true}
    />
  ),
  clicks: (camp, style, dates) => (
    <ClicksCell
      clicks={camp.clicks}
      dates={dates}
      cellStyle={style}
      ended={camp.endDate === '' ? false : true}
    />
  ),
  spend: (camp, style, dates) => (
    <SpendCell
      spend={camp.spend}
      dates={dates}
      cellStyle={style}
      ended={camp.endDate === '' ? false : true}
    />
  ),
  ctr: (camp, style, dates) => (
    <CtrCell
      ctr={camp.ctr}
      dates={dates}
      cellStyle={style}
      ctr14dTotal={camp.ctr14dTotal}
      ended={camp.endDate === '' ? false : true}
    />
  ),
  actionButtons: (camp, style) => (
    <ActionButtons camp={camp} cellStyle={style} />
  ),
};

export default CampaignsBody;
