import ConversationEventBase from "@/conversation/types/ConversationEventBase";
import ConversationEventType from "@/conversation/types/ConversationEventType";
import OperationType from "@/transactions/types/OperationType";

type MissingBinOperationEvent = ConversationEventBase & {
  binId:number|null,
  operation:OperationType|null
}

export function createMissingBinOperationEvent(binId:number|null, operation:OperationType|null):MissingBinOperationEvent {
  return {
    type: ConversationEventType.MISSING_BIN_OPERATION,
    timestamp: Date.now(),
    binId,
    operation
  };
}

export default MissingBinOperationEvent;
