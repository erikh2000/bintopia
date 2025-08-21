import ConversationEventBase from "@/conversation/types/ConversationEventBase";
import ConversationEventType from "./ConversationEventType";
import OperationType from "@/transactions/types/OperationType";

type SetActiveBinOperationEvent = ConversationEventBase & {
  binId:number|null,
  operation:OperationType|null
}

export function createSetActiveBinOperationEvent(binId:number|null, operation:OperationType|null):SetActiveBinOperationEvent {
  return {
    type:ConversationEventType.SET_ACTIVE_BIN_OPERATION,
    timestamp:Date.now(),
    binId,
    operation
  };
}

export default SetActiveBinOperationEvent;
