/**
 * Константы URL для новых фич.
 * Группируйте по доменам: campaigns, inventory, vendorCodes и т.д.
 */
export const endpoints = {
  cardGrouping: {
    getItemCardGroupsData: '/card_grouping/get_item_card_groups_data',
  },
  skusMetrics: {
    getSkusMetrics: '/get_db_data/skus_metrics',
  },
  skuDetail: {
    getSkuDetailed: '/get_db_data/sku_detailed',
    getCardMetrics: '/get_db_data/card_metrics',
  },
  categories: {
    getCategories: '/get_db_data/categories_metrics',
  },
  ordersToProcessors: {
    getPredicts: '/orders_to_processors/get_predicts',
  },
  tags: {
    getTags: '/tags/get_all_tags',
    createTag: '/tags/create_tags',
    linkTagsToSkus: '/tags/link_tags_to_skus',
    unlinkTagsFromSkus: '/tags/unlink_tags_from_skus',
    deleteTags: '/tags/delete_tags',
  },
};
