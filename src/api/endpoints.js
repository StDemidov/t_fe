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
    getSelfprices: '/get_db_data/selfprices',
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
  abTests: {
    getActive: '/ab_tests/active',
    getFinished: '/ab_tests/finished',
    getPending: '/ab_tests/pending',
    getSkusAvailability: '/ab_tests/skus_test_availability',
    getLaunchPrepInfo: '/ab_tests/launch_prep_info',
    prepareAbTest: '/ab_tests/prepare_ab_test',
    pause: '/ab_tests/pause',
    start: '/ab_tests/start',
    finish: '/ab_tests/finish',
    delete: '/ab_tests/delete',
  },
  promo: {
    skusForCampaign: '/advert/skus_for_campaign',
    balance: '/advert/balance',
    campaign: '/advert/campaign',
    campaignFixed: '/advert/campaign_fixed',
    clusters: '/advert/clusters',
    clustersDisabled: '/advert/clusters_disabled',
    logs: '/advert/logs',
    working: '/advert/working',
    finished: '/advert/finished',
    pending: '/advert/pending',
    start: '/advert/start',
    pause: '/advert/pause',
    finish: '/advert/finish',
    delete: '/advert/delete',
    create: '/advert/create_campaign',
    update: '/advert/update',
  },
};
