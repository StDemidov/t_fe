export function chunkArray(arr, chunksSize) {
  const result = [];
  for (let i = 0; i < arr.length; i += chunksSize) {
    result.push(arr.slice(i, i + chunksSize));
  }
  if (result.length === 0) {
    return [[]];
  }
  return result;
}
