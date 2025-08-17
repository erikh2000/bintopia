import ConversationEventBase from "@/conversation/types/ConversationEventBase";
import ConversationEventType from "@/conversation/types/ConversationEventType";

type ResumeEvent = ConversationEventBase;

export function createResumeEvent():ResumeEvent {
  return {
    type: ConversationEventType.RESUME,
    timestamp: Date.now()
  };
}

export default ResumeEvent;