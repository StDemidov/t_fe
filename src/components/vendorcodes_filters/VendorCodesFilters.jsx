import { useSelector, useDispatch } from 'react-redux';
import { FaCloud } from 'react-icons/fa';

import VCCategoryFilter from './category_filter/VCCategoryFilter';
import {
  createNewTag,
  selectCreateTag,
  selectVendorCodeMetrics,
  selectNewSkusTagsMain,
  selectNewSkusTagsCloth,
  selectNewSkusTagsOthers,
} from '../../redux/slices/vendorCodeSlice';

import styles from './style.module.css';
import VCNameFilter from './vc_name_filter/VCNameFilter';
import VCAbcFilter from './abc_filter/VCAbcFilter';
import DateFilter from './date_filter/dateFilter';
import VCSorting from './sorting/VCSorting';
import VCTagFilter from './tag_filter/VCTagFilter';
import { hostName } from '../../utils/host';
import VCTagClothFilter from './tag_filter_cloth/VCTagClothFilter';
import VCTagOthersFilter from './tag_filter_others/VCTagOthersFilter';

const VendorCodesFilters = () => {
  const vendorCodesWMetrics = useSelector(selectVendorCodeMetrics);
  const createdTags = useSelector(selectCreateTag);
  const newSkusTagsMain = useSelector(selectNewSkusTagsMain);
  const newSkusTagsCloth = useSelector(selectNewSkusTagsCloth);
  const newSkusTagsOthers = useSelector(selectNewSkusTagsOthers);
  const dispatch = useDispatch();

  let categories = vendorCodesWMetrics.map((vendorcode) => {
    return vendorcode.categoryName;
  });

  let tagsMain = [
    ...new Set(vendorCodesWMetrics.flatMap((item) => item.tagsMain)),
  ];

  let tagsCloth = [
    ...new Set(vendorCodesWMetrics.flatMap((item) => item.tagsCloth)),
  ];

  let tagsOthers = [
    ...new Set(vendorCodesWMetrics.flatMap((item) => item.tagsOthers)),
  ];

  let abc = vendorCodesWMetrics.map((vendorcode) => {
    return vendorcode.abcCurrent;
  });

  categories = [...new Set(categories)];
  abc = [...new Set(abc)];

  const handleCreateTag = () => {
    let data = {
      create_tags: createdTags,
      skus_tags_main: newSkusTagsMain,
      skus_tags_cloth: newSkusTagsCloth,
      skus_tags_others: newSkusTagsOthers,
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
      <VCTagFilter options={tagsMain} />
      <VCTagClothFilter options={tagsCloth} />
      <VCTagOthersFilter options={tagsOthers} />
      <VCSorting />
      <VCNameFilter />
      {createdTags.main.length ||
      createdTags.cloth.length ||
      createdTags.others.length ||
      newSkusTagsMain.length ||
      newSkusTagsCloth.length ||
      newSkusTagsOthers.length ? (
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
