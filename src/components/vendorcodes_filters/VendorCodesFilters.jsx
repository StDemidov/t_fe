import { useSelector, useDispatch } from 'react-redux';
import { FaCloud } from 'react-icons/fa';

import VCCategoryFilter from './category_filter/VCCategoryFilter';
import {
  createNewTag,
  selectCreateTag,
  selectVendorCodeMetrics,
  selectNewSkusTags,
} from '../../redux/slices/vendorCodeSlice';

import styles from './style.module.css';
import VCNameFilter from './vc_name_filter/VCNameFilter';
import VCAbcFilter from './abc_filter/VCAbcFilter';
import DateFilter from './date_filter/dateFilter';
import VCSorting from './sorting/VCSorting';
import VCTagFilter from './tag_filter/VCTagFilter';
import { hostName } from '../../utils/host';

const VendorCodesFilters = () => {
  const vendorCodesWMetrics = useSelector(selectVendorCodeMetrics);
  const createdTags = useSelector(selectCreateTag);
  const newSkusTags = useSelector(selectNewSkusTags);
  const dispatch = useDispatch();

  let categories = vendorCodesWMetrics.map((vendorcode) => {
    return vendorcode.categoryName;
  });

  let tags = [...new Set(vendorCodesWMetrics.flatMap((item) => item.tags))];

  let abc = vendorCodesWMetrics.map((vendorcode) => {
    return vendorcode.abcCurrent;
  });

  categories = [...new Set(categories)];
  abc = [...new Set(abc)];

  const handleCreateTag = () => {
    let data = {
      create_tags: createdTags,
      skus_tags: newSkusTags,
    };
    dispatch(
      createNewTag({
        data: data,
        url: `${hostName}/tags/create`,
      })
    );
  };

  return (
    <div className={styles.filterSection}>
      <DateFilter />
      <VCCategoryFilter options={categories} />
      <VCAbcFilter options={abc} />
      <VCTagFilter options={tags} />
      <VCSorting />
      <VCNameFilter />
      {createdTags.length || newSkusTags.length ? (
        // <button className={styles.createTag} onClick={handleCreateTag}>
        //   <span>Создать новые теги</span>
        // </button>
        <button className={styles.bookmarkBtn} onClick={handleCreateTag}>
          <span className={styles.iconContainer}>
            <FaCloud className={styles.icon} />
          </span>
          <p className={styles.text}>Сохранить изменения</p>
        </button>
      ) : (
        <></>
      )}
    </div>
  );
};

export default VendorCodesFilters;
