import ConversationEventBase from "@/conversation/types/ConversationEventBase";
import ConversationEventType from "./ConversationEventType";

type SetActiveBinEvent = ConversationEventBase & {
  binId:number
}

export function createSetActiveBinEvent(binId:number):SetActiveBinEvent {
  return {
    type:ConversationEventType.SET_ACTIVE_BIN,
    timestamp:Date.now(),
    binId:binId
  };
}

export default SetActiveBinEvent;
