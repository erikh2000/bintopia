import TransactionEvent from "@/conversation/types/TransactionEvent";
import SetActiveBinEvent from "@/conversation/types/SetActiveBinEvent";
import SetActiveOperationEvent from "@/conversation/types/SetActiveOperationEvent";

type ConversationEvent = TransactionEvent | SetActiveBinEvent | SetActiveOperationEvent;

export default ConversationEvent;