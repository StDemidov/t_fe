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

const CampaignsBody = ({
  columns,
  campaigns,
  dates,
  selectedCamps,
  setSelectedCamps,
}) => {
  return (
    <div className={styles.tableBody}>
      {campaigns.map((camp) => {
        return (
          <div className={styles.campRow} key={camp.campId}>
            {columns.map((col) => {
              if (!col.hidden) {
                return bodyCellsRender[col.key](
                  camp,
                  col.cellStyle,
                  dates,
                  selectedCamps,
                  setSelectedCamps,
                  `${camp.campId}-${col.key}`
                );
              }
            })}
          </div>
        );
      })}
    </div>
  );
};

const bodyCellsRender = {
  skuBase: (camp, style, dates, selectedCamps, setSelectedCamps, key) => (
    <SkuBaseCell
      key={key}
      image={camp.photo}
      sku={camp.sku}
      skuName={camp.skuName}
      campId={camp.campId}
      creationDate={camp.creationDate}
      cellStyle={style}
      selectedCamps={selectedCamps}
      setSelectedCamps={setSelectedCamps}
    />
  ),
  status: (camp, style, dates, selectedCamps, setSelectedCamps, key) => (
    <StatusCell key={key} camp={camp} cellStyle={style} />
  ),
  activeHours: (camp, style, dates, selectedCamps, setSelectedCamps, key) => (
    <ActiveHoursCell
      key={key}
      hasActiveHours={camp.hasActiveHours}
      startHour={camp.startHour}
      pauseHour={camp.pauseHour}
      cellStyle={style}
    />
  ),
  bidType: (camp, style, dates, selectedCamps, setSelectedCamps, key) => (
    <BidTypeCell key={key} bidType={camp.bidType} cellStyle={style} />
  ),
  bids: (camp, style, dates, selectedCamps, setSelectedCamps, key) => (
    <BidsCell key={key} camp={camp} cellStyle={style} />
  ),
  ctrBench: (camp, style, dates, selectedCamps, setSelectedCamps, key) => (
    <CtrBenchCell key={key} ctrBench={camp.ctrBench} cellStyle={style} />
  ),
  turnover: (camp, style, dates, selectedCamps, setSelectedCamps, key) => (
    <TurnoverCell
      key={key}
      lowerTurnoverThreshold={camp.lowerTurnoverThreshold}
      turnoverDays={camp.turnoverDays}
      turnoverByBarcodes={camp.turnoverByBarcodes}
      cellStyle={style}
    />
  ),
  totalSpend: (camp, style, dates, selectedCamps, setSelectedCamps, key) => (
    <TotalSpendCell
      key={key}
      totalSpend={camp.totalSpend}
      cellStyle={style}
      ended={camp.endDate === '' ? false : true}
    />
  ),
  totalCTR: (camp, style, dates, selectedCamps, setSelectedCamps, key) => (
    <TotalCtrCell
      key={key}
      totalCtr={camp.totalCtr}
      cellStyle={style}
      ended={camp.endDate === '' ? false : true}
    />
  ),
  views: (camp, style, dates, selectedCamps, setSelectedCamps, key) => (
    <ViewsCell
      key={key}
      views={camp.views}
      dates={camp.dates}
      cellStyle={style}
      ended={camp.endDate === '' ? false : true}
    />
  ),
  clicks: (camp, style, dates, selectedCamps, setSelectedCamps, key) => (
    <ClicksCell
      key={key}
      clicks={camp.clicks}
      dates={camp.dates}
      cellStyle={style}
      ended={camp.endDate === '' ? false : true}
    />
  ),
  spend: (camp, style, dates, selectedCamps, setSelectedCamps, key) => (
    <SpendCell
      key={key}
      spend={camp.spend}
      dates={camp.dates}
      cellStyle={style}
      ended={camp.endDate === '' ? false : true}
    />
  ),
  ctr: (camp, style, dates, selectedCamps, setSelectedCamps, key) => (
    <CtrCell
      key={key}
      ctr={camp.ctr}
      dates={camp.dates}
      cellStyle={style}
      currentCtrTotal={camp.currentCtrTotal}
      ended={camp.endDate === '' ? false : true}
    />
  ),
  actionButtons: (camp, style, dates, selectedCamps, setSelectedCamps, key) => (
    <ActionButtons key={key} camp={camp} cellStyle={style} />
  ),
};

export default CampaignsBody;
