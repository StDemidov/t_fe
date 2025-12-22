import React, { useState } from 'react';
import { useDispatch } from 'react-redux';

import { setCampaignsFilterSKU } from '../../../../redux/slices/filterSlice';

import styles from './style.module.css';

const SkuNameFilter = () => {
  const dispatch = useDispatch();
  const [skuName, setSkuName] = useState('');

  const handleSkuNameFilterChange = (e) => {
    setSkuName(e.target.value);
  };
  const handleFindSKU = (e) => {
    dispatch(setCampaignsFilterSKU(e.target.value));
  };

  return (
    <div className={styles.skuNameFilter}>
      <input
        value={skuName}
        onChange={(e) => handleSkuNameFilterChange(e)}
        onKeyDown={(e) => {
          if (e.key === 'Enter') {
            handleFindSKU(e);
          }
        }}
        type="text"
        placeholder="Отфильтровать по артикулу или SKU..."
        onFocus={() => {
          setSkuName('');
        }}
      />
    </div>
  );
};

export default SkuNameFilter;
