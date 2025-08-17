import Bin from "./Bin";

export const ELSEWHERE_BIN_ID = -1;

type BinSet = {
  bins:{[id:number]:Bin}
}

export function duplicateBinSet(binSet:BinSet):BinSet {
  const newBinSet:BinSet = { bins: {} };
  for(const binIdStr in binSet.bins) {
    const binId = parseInt(binIdStr);
    newBinSet.bins[binId] = binSet.bins[binId] ? {...binSet.bins[binId], items: [...binSet.bins[binId].items]} : binSet.bins[binId];
  }
  return newBinSet;
}

export function createEmptyBinSet():BinSet {
  return {bins:{}};
}

export default BinSet;