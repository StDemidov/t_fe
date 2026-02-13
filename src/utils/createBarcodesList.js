const sizeOrder = [
  'XXS-XS',
  'S-M',
  'L-XL',
  'XS',
  'S',
  'M',
  'L',
  'XL',
  'XXL',
  '4XL',
  'XS/155',
  'S/155',
  'M/155',
  'L/155',
  'XL/155',
  'XXL/155',
  'XS/175',
  'S/175',
  'M/175',
  'L/175',
  'XL/175',
  'XXL/175',
  'XS РОСТ 1',
  'S РОСТ 1',
  'M РОСТ 1',
  'L РОСТ 1',
  'XL РОСТ 1',
  'XXL РОСТ 1',
  'XS РОСТ 2',
  'S РОСТ 2',
  'M РОСТ 2',
  'L РОСТ 2',
  'XL РОСТ 2',
  'XXL РОСТ 2',
];

function toCamelCase(str) {
  return str.replace(/_([a-z])/g, (_, letter) => letter.toUpperCase());
}

function parseNumberArray(str) {
  return str.split(',').map(Number);
}

function transformBcData(bcData) {
  return bcData.map((item) => {
    return {
      id: item.id,
      sku: item.sku,
      vcName: item.vc_name,
      startDate: new Date(item.start_date),
      orders: parseNumberArray(item.orders),
      ebitda: parseNumberArray(item.ebitda),
      ebitdaDaily: parseNumberArray(item.daily_ebitda),
      prices: parseNumberArray(item.prices),
      adsCosts: parseNumberArray(item.ads_costs),
      abc: item.abc,
      abcCtgry: item.abc_ctrgy,
      image: item.image,
      selfPrice: Math.round(item.self_price),
      tagsMain: item.tags_main,
      tagsCloth: item.tags_cloth,
      tagsOthers: item.tags_others,
      category: item.category.name,
      barcodes: item.barcodes
        .sort((a, b) => {
          return (
            sizeOrder.indexOf(a.size.toUpperCase()) -
            sizeOrder.indexOf(b.size.toUpperCase())
          );
        })
        .map((barcode) => ({
          barcode: barcode.barcode,
          stock: barcode.stock,
          size: barcode.size,
          forecasts: parseNumberArray(barcode.forecasts),
        })),
    };
  });
}

const transformOrders = (data) => {
  const transformed = {};

  data.orders.forEach((order) => {
    if (!transformed[order.barcode]) {
      transformed[order.barcode] = [];
    }

    transformed[order.barcode].push({
      name: order.order_name,
      amount: order.amount,
      date: new Date(order.create_date),
    });
  });

  for (const key in transformed) {
    transformed[key].sort((a, b) => new Date(a.date) - new Date(b.date));
  }

  return transformed;
};

export default function createBarcodesList(data) {
  return {
    bcData: transformBcData(data.bc_data),
    orders: transformOrders(data),
  };
}
