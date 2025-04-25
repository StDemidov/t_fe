import styles from './style.module.css';
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';

import { FaEye } from 'react-icons/fa';
import { LuMousePointerClick } from 'react-icons/lu';
import { FaEdit } from 'react-icons/fa';
import { LuFileMinus2 } from 'react-icons/lu';
import { TbCirclePercentageFilled } from 'react-icons/tb';
import { FaRegCalendarPlus } from 'react-icons/fa';
import { GiMoneyStack } from 'react-icons/gi';
import { CiCircleMinus } from 'react-icons/ci';
import { MdAttachMoney } from 'react-icons/md';
import { PiTarget } from 'react-icons/pi';
import { GiPayMoney } from 'react-icons/gi';
import { FaMoneyBillWave } from 'react-icons/fa';
import { RiDeleteBin2Fill } from 'react-icons/ri';
import { FaPauseCircle } from 'react-icons/fa';
import { FaCirclePlay } from 'react-icons/fa6';
import { RiAuctionFill } from 'react-icons/ri';

import wbLogo from '../single-vendorcode/wb_logo.png';
import mpStatsLogo from '../single-vendorcode/mpstats_logo.svg';
import {
  pauseCampaign,
  runCampaign,
  endCampaign,
} from '../../redux/slices/autoCampaignsSlice';
import { hostName } from '../../utils/host';

const CMPGN_STATUS = {
  '-1': 'Кампания в процессе удаления',
  4: 'Готова к запуску',
  7: 'Кампания завершена',
  8: 'Отказался',
  9: 'Идут показы',
  11: 'Кампания на паузе',
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

const AutoCampaignsTable = ({ cmpgns }) => {
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const navigation = useNavigate();

  const handleClickOnEdit = (event) => {
    const id = event.currentTarget.getAttribute('data-value');
    navigation(`/tools/auto_campaigns/edit/${id}`);
  };

  const handleClickOnAuction = (event) => {
    const id = event.currentTarget.getAttribute('data-value');
    navigation(`/tools/auction_campaigns/create/${id}`);
  };

  const handleClickOnPause = (event) => {
    const id = event.currentTarget.getAttribute('data-value');
    dispatch(pauseCampaign(`${hostName}/autocampaigns/pause/${id}`));
  };

  const handleClickOnRun = (event) => {
    const id = event.currentTarget.getAttribute('data-value');
    dispatch(runCampaign(`${hostName}/autocampaigns/run/${id}`));
  };

  const handleClickOnBin = (event) => {
    const id = event.currentTarget.getAttribute('data-value');
    dispatch(endCampaign(`${hostName}/autocampaigns/end/${id}`));
  };

  const dispatch = useDispatch();

  return (
    <>
      <div className={styles.tableContainer}>
        {/* Левая часть с карточками кампаний */}
        <div className={styles.campaignList}>
          {cmpgns.map((cmpgn) => (
            <div key={cmpgn.campId}>
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
                      <div
                        className={styles.campaignStatus}
                        style={{
                          backgroundColor:
                            STATUS_COLORS[cmpgn.status.toString()] || '#e0e0e0',
                        }}
                      >
                        {CMPGN_STATUS[cmpgn.status.toString()] ||
                          'Статус неизвестен'}
                      </div>
                      <div
                        className={styles.campaignStatus}
                        style={{
                          backgroundColor:
                            CREATED_BY_COLORS[cmpgn.createdBy] || '#e0e0e0',
                        }}
                      >
                        {CREATED_BY[cmpgn.createdBy] || 'Статус неизвестен'}
                      </div>
                      {cmpgn.pausedByTurnover ? (
                        <div
                          className={styles.campaignStatus}
                          style={{
                            backgroundColor: '#ffcfcf',
                          }}
                        >
                          {'На паузе из-за оборачиваемости'}
                        </div>
                      ) : (
                        <></>
                      )}
                      {cmpgn.pausedByTime ? (
                        <div
                          className={styles.campaignStatus}
                          style={{
                            backgroundColor: '#f2d2bd',
                          }}
                        >
                          {'На паузе по времени'}
                        </div>
                      ) : (
                        <></>
                      )}
                      {cmpgn.hasActiveHours ? (
                        <div
                          className={styles.campaignStatus}
                          style={{
                            backgroundColor: '#f2d2bd',
                          }}
                        >
                          {`${cmpgn.startHour}:00 - ${cmpgn.endHour}:00`}
                        </div>
                      ) : (
                        <></>
                      )}
                    </div>
                    <div className={styles.campaignDetails}>
                      <FaEye /> {cmpgn.views}
                    </div>
                    <div className={styles.campaignDetails}>
                      <LuMousePointerClick /> {cmpgn.clicks}
                    </div>
                    <div className={styles.campaignDetails}>
                      <TbCirclePercentageFilled />{' '}
                      {(cmpgn.ctr * 100).toFixed(2)}%
                    </div>
                    <div className={styles.campaignDetails}>
                      <FaEdit /> {new Date(cmpgn.changeDate).toLocaleString()}
                    </div>
                    <div className={styles.campaignDetails}>
                      <LuFileMinus2 />{' '}
                      {cmpgn.excluded[0] === '' ? 0 : cmpgn.excluded.length}
                    </div>
                  </div>
                </div>
                <div className={styles.rightPart}>
                  <img
                    src={cmpgn.image}
                    alt={cmpgn.campName}
                    className={styles.campaignImage}
                  />
                  <div className={styles.actionButtons}>
                    {cmpgn.status === 11 ? (
                      <FaCirclePlay
                        className={styles.actionButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClickOnRun(e);
                        }}
                        data-value={cmpgn.id}
                      />
                    ) : cmpgn.status === 9 ? (
                      <FaPauseCircle
                        className={styles.actionButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClickOnPause(e);
                        }}
                        data-value={cmpgn.id}
                      />
                    ) : (
                      <></>
                    )}
                    {cmpgn.createdBy === 'SOFT' ? (
                      <FaEdit
                        className={styles.actionButton}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleClickOnEdit(e);
                        }}
                        data-value={cmpgn.id}
                      />
                    ) : (
                      <></>
                    )}

                    <RiAuctionFill
                      className={styles.actionButton}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClickOnAuction(e);
                      }}
                      data-value={cmpgn.id}
                    />
                    <RiDeleteBin2Fill
                      className={styles.bin}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleClickOnBin(e);
                      }}
                      data-value={cmpgn.id}
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
              <div className={styles.campaignParameters}>
                <h2 className={styles.campaignName}>
                  {selectedCampaign.campName}
                </h2>
                <div className={styles.links}>
                  <a
                    href={`https://www.wildberries.ru/catalog/${selectedCampaign?.sku}/detail.aspx`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      src={wbLogo}
                      className={styles.linkA}
                      width="20px"
                      alt="wb"
                      href={`https://www.wildberries.ru/catalog/${selectedCampaign?.sku}/detail.aspx`}
                    />
                  </a>
                  <a
                    href={`https://mpstats.io/wb/item/${selectedCampaign?.sku}`}
                    target="_blank"
                    rel="noreferrer"
                  >
                    <img
                      className={`${styles.linkA} ${styles.linkMP}`}
                      src={mpStatsLogo}
                      width="20px"
                      alt="wb"
                    />
                  </a>
                </div>
                <div className={styles.campaignInfo}>
                  <div
                    className={styles.campaignStatus}
                    style={{
                      backgroundColor:
                        STATUS_COLORS[selectedCampaign.status.toString()] ||
                        '#e0e0e0',
                    }}
                  >
                    {CMPGN_STATUS[selectedCampaign.status.toString()] ||
                      'Статус неизвестен'}
                  </div>
                  <div
                    className={styles.campaignStatus}
                    style={{
                      backgroundColor:
                        CREATED_BY_COLORS[selectedCampaign.createdBy] ||
                        '#e0e0e0',
                    }}
                  >
                    {CREATED_BY[selectedCampaign.createdBy] ||
                      'Статус неизвестен'}
                  </div>
                  {selectedCampaign.pausedByTurnover ? (
                    <div
                      className={styles.campaignStatus}
                      style={{
                        backgroundColor: '#ffcfcf',
                      }}
                    >
                      {'На паузе из-за оборачиваемости'}
                    </div>
                  ) : (
                    <></>
                  )}
                  {selectedCampaign.pausedByTime ? (
                    <div
                      className={styles.campaignStatus}
                      style={{
                        backgroundColor: '#f2d2bd',
                      }}
                    >
                      {'На паузе по времени'}
                    </div>
                  ) : (
                    <></>
                  )}
                  {selectedCampaign.hasActiveHours ? (
                    <div
                      className={styles.campaignStatus}
                      style={{
                        backgroundColor: '#f2d2bd',
                      }}
                    >
                      {`${selectedCampaign.startHour}:00 - ${selectedCampaign.endHour}:00`}
                    </div>
                  ) : (
                    <></>
                  )}
                </div>
                <div className={styles.campaignDetails}>
                  <FaEye /> {'Количество показов (ключей):'}{' '}
                  <b>{selectedCampaign.views}</b>
                </div>
                <div className={styles.campaignDetails}>
                  <LuMousePointerClick /> {'Количество кликов (по ключам):'}{' '}
                  <b>{selectedCampaign.clicks}</b>
                </div>
                <div className={styles.campaignDetails}>
                  <TbCirclePercentageFilled /> Средний CTR (ключи):{' '}
                  <b>{(selectedCampaign.ctr * 100).toFixed(2)}% </b>
                </div>
                <div className={styles.campaignDetails}>
                  <FaRegCalendarPlus />
                  {'Дата создания кампании: '}
                  <b>{selectedCampaign.creationDate} </b>
                </div>
                <div className={styles.campaignDetails}>
                  <FaEdit />
                  {'Дата последнего изменения: '}
                  <b>
                    {new Date(selectedCampaign.changeDate).toLocaleString()}
                  </b>
                </div>
                <div className={styles.campaignDetails}>
                  <GiMoneyStack /> {'Затраченные деньги (только по ключам):'}{' '}
                  <b>
                    {selectedCampaign.spend} {' руб.'}
                  </b>
                </div>
                <div className={styles.campaignDetails}>
                  <GiMoneyStack /> {'Все затраченные деньги:'}{' '}
                  <b>
                    {selectedCampaign.totalSpend} {' руб.'}
                  </b>
                </div>
                <div className={styles.campaignDetails}>
                  <GiMoneyStack /> {'Соотношение трат на ключи ко всем тратам:'}{' '}
                  <b>
                    {selectedCampaign.spendRatio} {' %'}
                  </b>
                </div>
                <div className={styles.campaignDetails}>
                  <MdAttachMoney /> {'Цена клика (только по ключам):'}{' '}
                  <b>
                    {selectedCampaign.clicks === 0
                      ? 0
                      : (
                          selectedCampaign.spend / selectedCampaign.clicks
                        ).toFixed(2)}{' '}
                    {' руб.'}
                  </b>
                </div>
                <div className={styles.campaignDetails}>
                  <LuFileMinus2 />
                  {'Количество исключений: '}
                  <b>
                    {selectedCampaign.excluded[0] === ''
                      ? 0
                      : selectedCampaign.excluded.length}
                  </b>
                </div>
                {selectedCampaign.createdBy === 'SOFT' ? (
                  <>
                    <div className={styles.campaignDetails}>
                      <PiTarget /> {'Порог по CTR:'}{' '}
                      <b>{selectedCampaign.ctrBench * 100}%</b>
                    </div>
                    <div className={styles.campaignDetails}>
                      <PiTarget /> {'Порог по просмотрам:'}{' '}
                      <b>{selectedCampaign.viewsBench}</b>
                    </div>
                    <div className={styles.campaignDetails}>
                      <GiPayMoney /> Пополнять бюджет, при остатке ниже:{' '}
                      <b>{selectedCampaign.whenToAddBudget} руб </b>
                    </div>
                    <div className={styles.campaignDetails}>
                      <FaMoneyBillWave />
                      {'Сумма пополнения: '}
                      <b>{selectedCampaign.howMuchToAdd} </b>
                    </div>
                    <div className={styles.campaignDetails}>
                      <FaMoneyBillWave />
                      {'Останавливать кампанию, при оборачиваемости ниже: '}
                      <b>{selectedCampaign.whenToPause} </b>
                    </div>
                  </>
                ) : (
                  <></>
                )}
              </div>

              {/* Поле с исключенными фразами */}
              <div className={styles.excludedPhrases}>
                {selectedCampaign.excluded.map((phrase, index) => (
                  <div key={index} className={styles.excludedPhrase}>
                    {phrase} <CiCircleMinus />
                  </div>
                ))}
              </div>
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

export default AutoCampaignsTable;
