import ConversationEventBase from "@/conversation/types/ConversationEventBase";
import ConversationEventType from "@/conversation/types/ConversationEventType";

type PauseEvent = ConversationEventBase;

export function createPauseEvent():PauseEvent {
  return {
    type: ConversationEventType.PAUSE,
    timestamp: Date.now()
  };
}

export default PauseEvent;
