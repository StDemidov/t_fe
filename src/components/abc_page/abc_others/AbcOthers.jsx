const AbcOthers = ({ abcData, categories }) => {
  return abcData.length === 0 ? (
    <div>Пусто</div>
  ) : (
    <div>{abcData.slice(-1).id}</div>
  );
};

export default AbcOthers;
