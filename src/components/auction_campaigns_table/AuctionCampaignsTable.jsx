import styles from './style.module.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { FaEye } from 'react-icons/fa';
import { LuMousePointerClick } from 'react-icons/lu';
import { FaEdit } from 'react-icons/fa';
import { GiMoneyStack } from 'react-icons/gi';
import { RiDeleteBin2Fill } from 'react-icons/ri';
import { FaPauseCircle } from 'react-icons/fa';
import { FaCirclePlay } from 'react-icons/fa6';

import {
  endCampaignFull,
  pauseCampaignFull,
  runCampaignFull,
  endCampaign,
  pauseCampaign,
  runCampaign,
} from '../../redux/slices/aucCampaignsSlice';

import { hostName } from '../../utils/host';

const CMPGN_STATUS = {
  '-1': 'Кампания в процессе удаления',
  4: 'Готова к запуску',
  7: 'Кампания завершена',
  8: 'Отказался',
  9: 'Идут показы',
  11: 'Кампания на паузе',
};

const STATUS_NAME_COLORS = {
  'Идут показы': '#cce5ff',
  'Остановлено в софте': '#fff0b3',
  'Пауза по оборачиваемости': '#ccccff',
};

const STATUS_COLORS = {
  '-1': '#ffcccc',
  4: '#ccffcc',
  7: '#ccccff',
  8: '#ffcc99',
  9: '#cce5ff',
  11: '#fff0b3',
};

const CREATED_BY_COLORS = {
  SOFT: '#ccffcc',
  NOT_SOFT: '#cce5ff',
};

const CREATED_BY = {
  SOFT: 'Контроль софтом',
  NOT_SOFT: 'Ручной контроль',
};

const AuctionCampaignsTable = ({ cmpgns }) => {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const navigation = useNavigate();
  const dispatch = useDispatch();

  const handleMainClickOnEdit = (event) => {
    const id = event.currentTarget.getAttribute('data-value');
    navigation(`/tools/auction_campaigns/edit/${id}`);
  };

  const handleMainClickOnPause = (event) => {
    const id = event.currentTarget.getAttribute('data-value');
    dispatch(
      pauseCampaignFull(`${hostName}/auctioncampaigns/pause_main/${id}`)
    );
  };

  const handleMainClickOnRun = (event) => {
    const id = event.currentTarget.getAttribute('data-value');
    dispatch(runCampaignFull(`${hostName}/auctioncampaigns/run_main/${id}`));
  };

  const handleMainClickOnBin = (event) => {
    const id = event.currentTarget.getAttribute('data-value');
    dispatch(endCampaignFull(`${hostName}/auctioncampaigns/delete_main/${id}`));
  };

  const handleClickOnEdit = (event) => {
    const id = event.currentTarget.getAttribute('data-value');
    navigation(`/tools/auction_campaigns/edit_part/${id}`);
  };

  const handleClickOnPause = (event) => {
    const id = event.currentTarget.getAttribute('data-value');
    dispatch(pauseCampaign(`${hostName}/auctioncampaigns/pause/${id}`));
  };

  const handleClickOnRun = (event) => {
    const id = event.currentTarget.getAttribute('data-value');
    dispatch(runCampaign(`${hostName}/auctioncampaigns/run/${id}`));
  };

  const handleClickOnBin = (event) => {
    const id = event.currentTarget.getAttribute('data-value');
    dispatch(endCampaign(`${hostName}/auctioncampaigns/end/${id}`));
  };

  return (
    <>
      <div className={styles.tableContainer}>
        {/* Левая часть с карточками кампаний */}
        <div className={styles.campaignList}>
          {cmpgns.map((cmpgn) => (
            <div key={cmpgn.parentID}>
              <div
                className={`${styles.card} ${styles.campaignCard}`}
                onClick={() => setSelectedCampaign(cmpgn)}
              >
                <div
                  className={`${styles.cardContent} ${styles.campaignCardContent}`}
                >
                  <div>
                    <h2 className={styles.campaignName}>{cmpgn.campName}</h2>
                    <div className={styles.campaignInfo}>
                      {cmpgn.onlineCamps === 0 ? (
                        <div
                          className={styles.campaignStatus}
                          style={{
                            backgroundColor: '#fff0b3',
                          }}
                        >
                          {`Все кампании отключены`}
                        </div>
                      ) : (
                        <div
                          className={styles.campaignStatus}
                          style={{
                            backgroundColor: STATUS_NAME_COLORS[cmpgn.status],
                          }}
                        >
                          {cmpgn.status}
                        </div>
                      )}
                    </div>
                    <div className={styles.campaignDetails}>
                      <FaEye /> {cmpgn.totalViews}
                    </div>
                    <div className={styles.campaignDetails}>
                      <LuMousePointerClick /> {cmpgn.ctr.toFixed(2)} %
                    </div>
                    <div className={styles.campaignDetails}>
                      <GiMoneyStack /> {Math.round(cmpgn.totalSpend)} {'руб.'}
                    </div>
                  </div>
                </div>
                <div className={styles.rightPart}>
                  <img
                    src={cmpgn.skuImage}
                    alt={cmpgn.sku}
                    className={styles.campaignImage}
                  />
                  <div className={styles.actionButtons}>
                    {cmpgn.onlineCamps !== cmpgn.campaigns.length ? (
                      <FaCirclePlay
                        className={styles.actionButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMainClickOnRun(e);
                        }}
                        data-value={cmpgn.parentID}
                      />
                    ) : cmpgn.onlineCamps != 0 ? (
                      <FaPauseCircle
                        className={styles.actionButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleMainClickOnPause(e);
                        }}
                        data-value={cmpgn.parentID}
                      />
                    ) : (
                      <></>
                    )}
                    <FaEdit
                      className={styles.actionButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMainClickOnEdit(e);
                      }}
                      data-value={cmpgn.parentID}
                    />

                    <RiDeleteBin2Fill
                      className={styles.bin}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMainClickOnBin(e);
                      }}
                      data-value={cmpgn.parentID}
                    />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        {/* Правая часть с информацией о выбранной кампании */}
        <div className={styles.campaignDetailsContainer}>
          {selectedCampaign ? (
            <div className={styles.campaignDetailsWrapper}>
              {selectedCampaign.campaigns.map((partCamp) => (
                <>
                  <div
                    className={styles.campaignParameters}
                    key={partCamp.camp_id}
                  >
                    <h2 className={styles.campaignName}>
                      {partCamp.camp_name}
                    </h2>
                    <div className={styles.campaignInfo}>
                      {partCamp.paused_by_trnover ? (
                        <div
                          className={styles.campaignStatus}
                          style={{
                            backgroundColor: '#ffcfcf',
                          }}
                        >
                          {'На паузе из-за оборачиваемости'}
                        </div>
                      ) : (
                        <>
                          {partCamp.paused_in_soft ? (
                            <div
                              className={styles.campaignStatus}
                              style={{
                                backgroundColor:
                                  STATUS_NAME_COLORS['Остановлено в софте'],
                              }}
                            >
                              {'Остановлено в софте'}
                            </div>
                          ) : (
                            <div
                              className={styles.campaignStatus}
                              style={{
                                backgroundColor:
                                  STATUS_NAME_COLORS['Идут показы'],
                              }}
                            >
                              {'Идут показы'}
                            </div>
                          )}
                        </>
                      )}
                    </div>

                    <div className={styles.partCampaign}>
                      <div className={styles.partCampaignInfo}>
                        <div className={styles.campaignDetails}>
                          <FaEye /> {'Количество показов:'}{' '}
                          <b>{partCamp.views + partCamp.today_views}</b>
                        </div>
                        <div className={styles.campaignDetails}>
                          <LuMousePointerClick /> {'Количество кликов:'}{' '}
                          <b>{partCamp.clicks + partCamp.today_clicks}</b>
                        </div>
                        <div className={styles.campaignDetails}>
                          <LuMousePointerClick /> {'CTR:'}{' '}
                          <b>
                            {partCamp.views + partCamp.today_views === 0
                              ? 0
                              : (
                                  ((partCamp.clicks + partCamp.today_clicks) /
                                    (partCamp.views + partCamp.today_views)) *
                                  100
                                ).toFixed(2)}
                            {'%'}
                          </b>
                        </div>
                        <div className={styles.campaignDetails}>
                          <GiMoneyStack /> {'Затраченные деньги:'}{' '}
                          <b>
                            {Math.round(partCamp.spend + partCamp.today_spend)}{' '}
                            {' руб.'}
                          </b>
                        </div>
                        <div className={styles.campaignDetails}>
                          <GiMoneyStack /> {'CPM:'}{' '}
                          <b>
                            {partCamp.cpm} {' руб.'}
                          </b>
                        </div>
                      </div>
                    </div>
                  </div>
                  {partCamp?.top_words ? (
                    <div className={styles.topWords}>
                      {partCamp.top_words.split(',').map((topList) => {
                        return (
                          <div className={styles.topWordsRow}>
                            <div className={styles.topWordText}>
                              {topList.split(';')[0]}
                            </div>
                            <div className={styles.topWordMetrics}>
                              <div className={styles.topWordMetricBlock}>
                                <FaEye />
                                {topList.split(';')[1]}
                              </div>
                              <div className={styles.topWordMetricBlock}>
                                <LuMousePointerClick />
                                {(topList.split(';')[2] * 100).toFixed(2)} %
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className={styles.noTopWords}>Нет списка ключей</div>
                  )}
                </>
              ))}
            </div>
          ) : (
            <div className={styles.noCampaignSelected}>
              Выберите кампанию, чтобы увидеть детали
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default AuctionCampaignsTable;
