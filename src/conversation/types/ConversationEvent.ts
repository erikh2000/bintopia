import TransactionEvent from "@/conversation/types/TransactionEvent";
import SetActiveBinOperationEvent from "@/conversation/types/SetActiveBinOperationEvent";
import PauseEvent from "@/conversation/types/PauseEvent";
import ResumeEvent from "@/conversation/types/ResumeEvent";
import MissingBinOperationEvent from "@/conversation/types/MissingBinOperationEvent";

type ConversationEvent = TransactionEvent | SetActiveBinOperationEvent | PauseEvent | ResumeEvent | MissingBinOperationEvent;

export default ConversationEvent;