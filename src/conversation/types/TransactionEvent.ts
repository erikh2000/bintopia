import BinTransaction from "@/transactions/types/BinTransaction";
import ConversationEventBase from "@/conversation/types/ConversationEventBase";
import ConversationEventType from "@/conversation/types/ConversationEventType";

type TransactionEvent = ConversationEventBase & { 
  tx:BinTransaction
}

export function createTransactionEvent(tx:BinTransaction):TransactionEvent {
  return {
    type: ConversationEventType.TRANSACTION,
    timestamp: Date.now(),
    tx
  };
}

export default TransactionEvent;
