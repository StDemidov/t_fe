export const getDataForPeriod = (data, startDate, endDate) => {
  const todayDate = new Date();
  const startIndex = Math.ceil((todayDate - startDate) / (1000 * 60 * 60 * 24)); // Индекс начала
  const endIndex = Math.floor((todayDate - endDate) / (1000 * 60 * 60 * 24)); // Индекс конца
  // Проверяем, что индексы в пределах массива
  if (startIndex < 0 || endIndex >= data.length || startIndex < endIndex) {
    throw new Error('Период выходит за пределы массива');
  }
  // Извлекаем данные за указанный период
  if (endIndex === 1) {
    return data.slice(-startIndex + 1);
  }
  return data.slice(-startIndex + 1, -endIndex + 1);
};

export const getSum = (data, startDate, endDate) => {
  const currData = getDataForPeriod(data, startDate, endDate);
  var sumData = currData.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);
  return sumData;
};

export const getDataForPeriodRaw = (data, raw_data, startDate, endDate) => {
  const todayDate = new Date();
  const startIndex = Math.ceil((todayDate - startDate) / (1000 * 60 * 60 * 24)); // Индекс начала
  const endIndex = Math.floor((todayDate - endDate) / (1000 * 60 * 60 * 24)); // Индекс конца
  if (startIndex <= raw_data.length + 1 && endIndex <= raw_data.length + 1) {
    if (endIndex === 1) {
      return raw_data.slice(-startIndex + 1);
    }
    return raw_data.slice(-startIndex + 1, -endIndex + 1);
  } else if (
    startIndex > raw_data.length + 1 &&
    endIndex > raw_data.length + 1
  ) {
    return data.slice(
      -startIndex + raw_data.length + 1,
      -endIndex + raw_data.length + 1
    ); // Используем reverse(), чтобы вернуть порядок
  } else if (
    startIndex > raw_data.length + 1 &&
    endIndex <= raw_data.length + 1
  ) {
    if (endIndex === 1) {
      return data.slice(-startIndex + raw_data.length + 1).concat(raw_data);
    }
  }
  return data
    .slice(-startIndex + raw_data.length + 1)
    .concat(raw_data.slice(0, -endIndex + 1));
};

export const getSumRaw = (data, raw_data, startDate, endDate) => {
  const currData = getDataForPeriodRaw(data, raw_data, startDate, endDate);
  var sumData = currData.reduce((accumulator, currentValue) => {
    return accumulator + currentValue;
  }, 0);
  return sumData;
};
