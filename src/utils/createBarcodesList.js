const sizeOrder = [
  'XS',
  'S',
  'M',
  'L',
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
      image: item.image,
      selfPrice: Math.round(item.self_price),
      barcodes: item.barcodes
        .sort((a, b) => {
          return sizeOrder.indexOf(a.size) - sizeOrder.indexOf(b.size);
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
    });
  });

  return transformed;
};

export default function createBarcodesList(data) {
  return {
    bcData: transformBcData(data.bc_data),
    orders: transformOrders(data),
  };
}
