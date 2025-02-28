import BarcodesTableNew from '../barcodes_table_new/BarcodesTableNew';

const BarcodesListNew = () => {
  const barcodes = [
    {
      barcode: '123456',
      stock: 180,
      forecasts: [
        50, 60, 60, 40, 30, 20, 10, 50, 60, 70, 50, 60, 70, 40, 30, 20, 10, 50,
        20, 10, 50, 60, 70,
      ],
    },
    {
      barcode: '789012',
      stock: 100,
      forecasts: [
        30, 40, 50, 20, 10, 60, 30, 40, 50, 20, 30, 40, 50, 20, 10, 60, 30, 40,
        60, 30, 40, 50, 20,
      ],
    },
  ];

  const orders = {
    123456: [
      { name: 'Заказ 1', amount: 40 },
      { name: 'Заказ 2', amount: 40 },
      { name: 'Заказ 3', amount: 25 },
    ],
    789012: [
      { name: 'Заказ A', amount: 50 },
      { name: 'Заказ B', amount: 30 },
    ],
  };

  const endDate = '2025-07-31';
  return (
    <section>
      <BarcodesTableNew barcodes={barcodes} endDate={endDate} orders={orders} />
    </section>
  );
};

export default BarcodesListNew;
