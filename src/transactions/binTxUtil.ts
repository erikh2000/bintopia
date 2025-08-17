import { createEmptyBin } from "./types/Bin";
import BinSet, { duplicateBinSet, ELSEWHERE_BIN_ID } from "./types/BinSet";
import BinTransaction from "./types/BinTransaction";
import OperationType from "./types/OperationType";

const theBinSet:BinSet = { bins: {} };

function _removeItemFromBin(binSet:BinSet, binId:number, item:string) {
  const bin = binSet.bins[binId];
  if (!bin) return;
  if (bin.items.includes(item)) bin.items = bin.items.filter(i => i !== item); 
}

function _addItemToBin(binSet:BinSet, binId:number, item:string) {
  let bin = binSet.bins[binId];
  if (!bin) bin = binSet.bins[binId] = createEmptyBin(binId);
  if (!bin.items.includes(item)) bin.items.push(item);
}

function _moveItem(binSet:BinSet, fromBinId:number, toBinId:number, item:string) {
  _removeItemFromBin(binSet, fromBinId, item);
  _addItemToBin(binSet, toBinId, item);
}

function _moveItems(binSet:BinSet, fromBinId:number, toBinId:number, items:string[]) {
  items.forEach(item => _moveItem(binSet, fromBinId, toBinId, item));
}

export function processBinTransaction(tx:BinTransaction):BinSet {
  switch(tx.operation) {
    case OperationType.ADD_TO_BIN: _moveItems(theBinSet, ELSEWHERE_BIN_ID, tx.binId, tx.items); break;
    case OperationType.REMOVE_FROM_BIN: _moveItems(theBinSet, tx.binId, ELSEWHERE_BIN_ID, tx.items); break;
    default: throw Error('Unexpected');
  }
  return duplicateBinSet(theBinSet);
}