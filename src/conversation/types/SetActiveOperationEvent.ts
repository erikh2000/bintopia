import OperationType from "@/transactions/types/OperationType";
import ConversationEventBase from "@/conversation/types/ConversationEventBase";
import ConversationEventType from "@/conversation/types/ConversationEventType";

type SetActiveOperationEvent = ConversationEventBase & {
  operation:OperationType
}

export function createSetActiveOperationEvent(operation:OperationType):SetActiveOperationEvent {
  return {
    type: ConversationEventType.SET_ACTIVE_OPERATION,
    timestamp: Date.now(),
    operation
  };
}

export default SetActiveOperationEvent;
