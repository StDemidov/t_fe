const createCampaignSingle = (data) => {
  const {
    camp_stats,
    clusters,
    logs,
    last_update_stats,
    last_update_clusters,
    photo,
  } = data;

  const campId = camp_stats.id;

  return {
    [campId]: {
      stats: transformObject(camp_stats, { excludeKeys: ['id'] }),
      clusters: clusters.map((cluster) => transformObject(cluster)),
      logs: logs.map((log) => transformObject(log)),
      photo: photo,
      lastUpdateStats: parseDateSafe(last_update_stats),
      lastUpdateClusters: parseDateSafe(last_update_clusters),
    },
  };
};

export default createCampaignSingle;

// ---------- helpers ----------

// snake_case -> camelCase
const toCamel = (str) => str.replace(/_([a-z])/g, (_, c) => c.toUpperCase());

// "1,2,3" -> [1,2,3]
const csvToNumbers = (value) =>
  typeof value === 'string' && /^-?\d+(\.\d+)?(,\s*-?\d+(\.\d+)?)*$/.test(value)
    ? value.split(',').map(Number)
    : value;

// Универсальный парсер дат (mac + windows)
const parseDateSafe = (value) => {
  if (typeof value !== 'string' || !value) return value;

  // YYYY-MM-DD,HH:mm -> YYYY-MM-DDTHH:mm
  if (/^\d{4}-\d{2}-\d{2},\d{2}:\d{2}$/.test(value)) {
    return new Date(value.replace(',', 'T'));
  }

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return new Date(`${value}T00:00:00`);
  }

  return value;
};

// универсальный преобразователь объекта
const transformObject = (obj, { excludeKeys = [] } = {}) =>
  Object.entries(obj).reduce((acc, [key, value]) => {
    if (excludeKeys.includes(key)) return acc;

    const camelKey = toCamel(key);

    let newValue = value;
    newValue = csvToNumbers(newValue);
    newValue = parseDateSafe(newValue);

    acc[camelKey] = newValue;
    return acc;
  }, {});
