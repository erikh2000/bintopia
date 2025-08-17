import ConversationEventType from "@/conversation/types/ConversationEventType";

type ConversationEventBase = {
  type:ConversationEventType,
  timestamp:number
}

export default ConversationEventBase;
