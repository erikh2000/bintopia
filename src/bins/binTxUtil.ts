import BinSet, { duplicateBinSet } from "./types/BinSet";
import BinTransaction from "./types/BinTransaction";

const theBinSet:BinSet = { bins: {} };

export function processBinTransaction(tx:BinTransaction) {
  let bin = theBinSet.bins[tx.binId];
  if (!bin) {
    bin = { id: tx.binId, items: [] };
    theBinSet.bins[tx.binId] = bin;
  }

  if (tx.operation === OperationType.ADD_TO_BIN) {
    for(const item of tx.items) {
      if (!bin.items.includes(item)) {
        bin.items.push(item);
      }
    }
  } else if (tx.operation === OperationType.REMOVE_FROM_BIN) {
    bin.items = bin.items.filter(i => !tx.items.includes(i));
  } else {
    console.warn(`Unknown bin transaction operation: ${tx.operation}`);
  }
}

export function getBinSet():BinSet {
  return duplicateBinSet(theBinSet);
} // NEXT create a BinSetView component that takes a BinSet and displays it nicely. prompt will call a setter.