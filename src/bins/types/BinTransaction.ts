import OperationType from "./OperationType";

type BinTransaction = {
  operation:OperationType,
  binId:number,
  items:string[]
}

export default BinTransaction;