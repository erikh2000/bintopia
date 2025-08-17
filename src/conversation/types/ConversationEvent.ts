import TransactionEvent from "@/conversation/types/TransactionEvent";
import SetActiveBinEvent from "@/conversation/types/SetActiveBinEvent";
import SetActiveOperationEvent from "@/conversation/types/SetActiveOperationEvent";
import PauseEvent from "@/conversation/types/PauseEvent";
import ResumeEvent from "@/conversation/types/ResumeEvent";

type ConversationEvent = TransactionEvent | SetActiveBinEvent | SetActiveOperationEvent | PauseEvent | ResumeEvent;

export default ConversationEvent;