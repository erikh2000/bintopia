import { isServingLocally } from "@/developer/devEnvUtil";
import { isLlmConnected } from "@/llm/llmUtil";
import { findOperation } from "../../understanding/operationUtil";
import { errorToast, infoToast } from "decent-portal";
import { findItems } from "../../understanding/itemsUtil";
import { findBinId } from "@/understanding/binIdUtil";
import BinTransaction from "@/transactions/types/BinTransaction";
import { processBinTransaction } from "@/transactions/binTxUtil";
import OperationType from "@/transactions/types/OperationType";
import { addConversationEvent, clearUnprocessedEvents, isPaused, pauseConversation, resumeConversation, speakSummaryOfUnprocessedEvents } from "@/conversation/conversationUtil";
import { createSetActiveBinOperationEvent } from "@/conversation/types/SetActiveBinOperationEvent";
import { createTransactionEvent } from "@/conversation/types/TransactionEvent";
import { isPausing, isResuming } from "@/understanding/pauseUtil";
import { createResumeEvent } from "@/conversation/types/ResumeEvent";
import { createPauseEvent } from "@/conversation/types/PauseEvent";
import { createMissingBinOperationEvent } from "@/conversation/types/MissingBinOperationEvent";

let activeBinId:number|null = null;
let activeOperation:OperationType|null = null;

function _createTransaction(activeBinId:number|null, activeOperation:OperationType|null, items:string[]):BinTransaction|null {
  if (items.length === 0 || activeBinId === null || activeOperation === null) return null;
  return {
    binId: activeBinId,
    operation: activeOperation,
    items: items
  };
}

function _executeDeveloperCommand(prompt:string, setPrompt:Function, setBinSet:Function) {
  if (prompt === '@reset') {
    activeBinId = null;
    activeOperation = null;
    const nextBinSet = processBinTransaction({binId: 0, operation: OperationType.CLEAR_BINSET, items: []});
    setBinSet(nextBinSet);
    clearUnprocessedEvents();
  } else {
    errorToast(`Unknown developer command: ${prompt}`);
  }
  setPrompt('');
  infoToast(`Developer command executed: ${prompt}`);
}

export async function submitPrompt(prompt:string, setPrompt:Function, setIsBusy:Function, 
    setActiveBinId:Function, setActiveOperation:Function, setBinSet:Function) {
  try {
    
    if (!isLlmConnected()) { 
      const message = isServingLocally() 
      ? `LLM is not connected. You're in a dev environment where this is expected (hot reloads, canceling the LLM load). You can refresh the page to load the LLM.`
      : 'LLM is not connected. Try refreshing the page.';
      errorToast(message);
      return; 
    }

    setIsBusy(true);

    if (prompt.startsWith('@')) {
      _executeDeveloperCommand(prompt, setPrompt, setBinSet);
      return;
    }

    if (isPaused()) {
      if (isResuming(prompt)) {
        resumeConversation();
        addConversationEvent(createResumeEvent());
      }
      return;
    }

    if (isPausing(prompt)) {
      pauseConversation();
      addConversationEvent(createPauseEvent());
      return;
    }

    let wasActiveBinOperationChanged = false;
    const nextBinId = findBinId(prompt);
    if (nextBinId !== -1 && nextBinId !== activeBinId) {
      setActiveBinId(nextBinId);
      activeBinId = nextBinId;
      wasActiveBinOperationChanged = true;
    }

    const nextOperation = await findOperation(prompt);
    if (nextOperation !== null && nextOperation !== activeOperation) {
      setActiveOperation(nextOperation);
      activeOperation = nextOperation;
      wasActiveBinOperationChanged = true;
    }

    if (wasActiveBinOperationChanged) addConversationEvent(createSetActiveBinOperationEvent(activeBinId, activeOperation));

    const items = await findItems(prompt, _onFoundItem);
    if (items.length && (activeBinId === null || activeOperation === null)) addConversationEvent(createMissingBinOperationEvent(activeBinId, activeOperation));
    speakSummaryOfUnprocessedEvents();

    async function _onFoundItem(itemName:string) {
      const transaction = _createTransaction(activeBinId, activeOperation, [itemName]);
      if (transaction) {
        const nextBinSet = processBinTransaction(transaction);
        setBinSet(nextBinSet);
        addConversationEvent(createTransactionEvent(transaction));
      }
    }
  } catch(e) {
    console.error('Error while generating response.', e);
  } finally {
    setPrompt('');
    setIsBusy(false);
  }
}