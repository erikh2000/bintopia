import Bin from "@/bins/types/Bin";
import BinSet from "@/bins/types/BinSet"
import styles from './BinSetView.module.css';
import BinView from "./BinView";
import OperationType from "@/bins/types/OperationType";

type Props = {
  binSet:BinSet,
  activeBinId:number|null,
  activeOperation:OperationType|null
}

function _getBinStatusText(binId:number, activeBinId:number|null, activeOperation:OperationType|null):string|undefined {
  if (binId !== activeBinId || activeOperation === null) return undefined;
  switch(activeOperation) {
    case OperationType.ADD_TO_BIN: return `adding`;
    case OperationType.REMOVE_FROM_BIN: return `removing`;
    default: return undefined;
  }
}

function BinSetView({binSet, activeBinId, activeOperation}:Props) {
  const bins = Object.values(binSet.bins);
  const binContent = bins.map((bin:Bin) => { 
    const binStatus = _getBinStatusText(bin.id, activeBinId, activeOperation);
    return <BinView key={bin.id} bin={bin} isActive={bin.id === activeBinId} status={binStatus}/>;
  });
  return <div className={styles.container}>{binContent}</div>;
}

export default BinSetView;