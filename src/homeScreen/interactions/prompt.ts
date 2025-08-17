import { isServingLocally } from "@/developer/devEnvUtil";
import { isLlmConnected } from "@/llm/llmUtil";
import { findOperation } from "../../understanding/operationUtil";
import { errorToast } from "decent-portal";
import { findItems } from "../../understanding/itemsUtil";
import { findBinId } from "@/understanding/binIdUtil";
import BinTransaction from "@/transactions/types/BinTransaction";
import { processBinTransaction } from "@/transactions/binTxUtil";
import OperationType from "@/transactions/types/OperationType";
import { addConversationEvent } from "@/conversation/conversationUtil";
import { createSetActiveBinEvent } from "@/conversation/types/SetActiveBinEvent";
import { createSetActiveOperationEvent } from "@/conversation/types/SetActiveOperationEvent";
import { createTransactionEvent } from "@/conversation/types/TransactionEvent";

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

    const nextBinId = findBinId(prompt);
    if (nextBinId !== -1 && nextBinId !== activeBinId) {
      setActiveBinId(nextBinId);
      activeBinId = nextBinId;
      addConversationEvent(createSetActiveBinEvent(nextBinId));
    }

    const nextOperation = await findOperation(prompt);
    if (nextOperation !== null && nextOperation !== activeOperation) {
      setActiveOperation(nextOperation);
      activeOperation = nextOperation;
      addConversationEvent(createSetActiveOperationEvent(nextOperation));
    }

    const items = await findItems(prompt, _onFoundItem);
    console.log(`Bin ID: ${activeBinId}, operation: ${activeOperation}, items: ${items}`);

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