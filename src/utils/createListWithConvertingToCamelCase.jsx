export default function convertKeysToCamelCase(items) {
  if (!Array.isArray(items)) {
    throw new Error('Входные данные должны быть массивом');
  }

  return items.map((item) => {
    const newItem = {};

    for (const [key, value] of Object.entries(item)) {
      // Преобразуем snake_case в lowerCamelCase
      const camelCaseKey = key.replace(/_([a-z])/g, (_, letter) =>
        letter.toUpperCase()
      );
      newItem[camelCaseKey] = value;
    }

    return newItem;
  });
}
