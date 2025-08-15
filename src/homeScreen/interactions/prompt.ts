import { isServingLocally } from "@/developer/devEnvUtil";
import { isLlmConnected } from "@/llm/llmUtil";
import { findOperation } from "../../conversation/operationUtil";
import { errorToast } from "decent-portal";
import { findItems } from "../../conversation/itemsUtil";
import { findBinId } from "@/conversation/binIdUtil";
import BinTransaction from "@/bins/types/BinTransaction";

let activeBinId:number|null = null;
let activeOperation:OperationType|null = null;

function _createTransaction(activeBinId:number|null, activeOperation:OperationType|null, items:string[]):BinTransaction|null {
  if (items.length === 0) return null;
  if (activeBinId === null) { errorToast(`Not sure which bin you are using. Say it like "number three" and I'll know.`); return null; }
  if (activeOperation === null) { errorToast(`Are you adding or removing items? I need to know so I can update the bin correctly.`); return null; }
  return {
    binId: activeBinId,
    operation: activeOperation,
    items: items
  };
}

export async function submitPrompt(prompt:string, setPrompt:Function, setIsBusy:Function, 
    setActiveBinId:Function, setActiveOperation:Function, setLastTransaction:Function) {
  try {
    
    if (!isLlmConnected()) { 
      const message = isServingLocally() 
      ? `LLM is not connected. You're in a dev environment where this is expected (hot reloads, canceling the LLM load). You can refresh the page to load the LLM.`
      : 'LLM is not connected. Try refreshing the page.';
      errorToast(message);
      return; 
    }

    setIsBusy(true);

    console.log(`activeBinId: ${activeBinId}, activeOperation: ${activeOperation}, prompt: ${prompt}`);
    const nextBinId = findBinId(prompt);
    if (nextBinId !== -1) {
      setActiveBinId(nextBinId); 
      activeBinId = nextBinId;
    }

    const nextOperation = await findOperation(prompt);
    if (nextOperation !== null) {
      setActiveOperation(nextOperation);
      activeOperation = nextOperation;
    }

    const items = await findItems(prompt);
    console.log(`Bin ID: ${activeBinId}, operation: ${activeOperation}, items: ${items}`);
    if (items.length > 0) {
      const transaction = _createTransaction(activeBinId, activeOperation, items);
      if (transaction) setLastTransaction(transaction);
    }
  } catch(e) {
    console.error('Error while generating response.', e);
  } finally {
    setPrompt('');
    setIsBusy(false);
  }
}