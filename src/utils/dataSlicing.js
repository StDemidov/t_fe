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

export const getAverage = (data, startDate, endDate) => {
  const currData = getDataForPeriod(data, startDate, endDate).filter(
    (value) => value !== 0
  );
  if (currData.length === 0) return 0;
  const sumData = currData.reduce(
    (accumulator, currentValue) => accumulator + currentValue,
    0
  );
  return Math.round(sumData / currData.length);
};

export const getDateNumberArray = (dataArray) => {
  // Определяем вчерашнюю дату
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  // Функция для форматирования даты в формате "день - номер месяца"
  const formatDateNumber = (date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1; // Месяцы начинаются с 0, поэтому +1
    return `${day}.${String(month).length === 1 ? '0' + String(month) : month}`;
  };

  // Создаем массив с датами на основе длины массива чисел
  const datesArray = [];
  for (let i = dataArray.length - 1; i >= 0; i--) {
    // Каждая дата уменьшается на i дней от вчерашнего дня
    const date = new Date(yesterday);
    date.setDate(yesterday.getDate() - i);
    datesArray.push(formatDateNumber(date));
  }

  return datesArray;
};
