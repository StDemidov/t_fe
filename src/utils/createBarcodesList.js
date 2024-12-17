const createBarcodesList = (inputObj) => {
  const sizeOrder = [
    'XS',
    'S',
    'L',
    'M',
    'XL',
    'XXL',
    '4XL',
    'XS/155',
    'XS/175',
    'S/155',
    'S/175',
    'M/155',
    'M/175',
    'L/155',
    'L/175',
    'XL/155',
    'XXL/175',
  ];

  // Функция для сортировки ключей barcodes по size
  const sortBarcodes = (barcodes) => {
    return Object.fromEntries(
      Object.entries(barcodes).sort(
        ([_, a], [__, b]) =>
          sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size)
      )
    );
  };

  // Создаем новый объект с отсортированными barcodes
  const sortedObj = {};
  for (const [articleName, articleData] of Object.entries(inputObj)) {
    sortedObj[articleName] = {
      ...articleData,
      barcodes: sortBarcodes(articleData.barcodes),
    };
  }

  return sortedObj;
};

export default createBarcodesList;

// data.sort(function (a, b) {
//   const orderABC = ['AAA', 'A', 'B', 'BC30', 'BC10', 'C', 'G', ''];
//   var indexA = orderABC.indexOf(a.abcCurrent);
//   var indexB = orderABC.indexOf(b.abcCurrent);
//   return indexA > indexB ? -1 : 1;
// });
