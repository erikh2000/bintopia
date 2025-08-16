import { isServingLocally } from "@/developer/devEnvUtil";
import { isLlmConnected } from "@/llm/llmUtil";
import { findOperation } from "../../conversation/operationUtil";
import { errorToast } from "decent-portal";
import { findItems } from "../../conversation/itemsUtil";
import { findBinId } from "@/conversation/binIdUtil";
import BinTransaction from "@/bins/types/BinTransaction";
import { processBinTransaction } from "@/bins/binTxUtil";
import OperationType from "@/bins/types/OperationType";
import { mute, unmute } from "./initialization";

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

export async function say(text:string):Promise<void> { // TODO refactor
  const utterance = new SpeechSynthesisUtterance(text);
  mute();
  utterance.rate = 1.5;
  return new Promise((resolve, reject) => {
    utterance.onend = () => {
      unmute();
      resolve();
    };
    utterance.onerror = (e) => {
      unmute();
      reject(e);
    };
    window.speechSynthesis.speak(utterance);
  });
}

async function _sayBinAndOperation(binId:number, operation:OperationType) {
  let operationText = '';
  switch(operation) {
    case OperationType.ADD_TO_BIN: operationText = 'Adding to'; break;
    case OperationType.REMOVE_FROM_BIN: operationText = 'Removing from'; break;
    default: throw Error('Unexpected');
  }
  operationText += `#${binId}.`;
  return await say(operationText);
}

async function _sayItem(operation:OperationType, itemName:string) {
  let operationText = itemName;
  switch(operation) {
    case OperationType.ADD_TO_BIN: operationText = ' added.'; break;
    case OperationType.REMOVE_FROM_BIN: operationText = ' removed.'; break;
    default: throw Error('Unexpected');
  }
  return await say(itemName + operationText);
}

async function _sayWhatIsMissing(binId:number|null, operation:OperationType|null) {
  if (binId === null && operation === null) {
    return await say('Please tell me which bin # and whether you are adding or removing items.');
  }
  if (binId === null) return await say('Which bin # are you using?');
  if (operation === null) return await say('Are you adding or removing items?');
  throw Error('Unexpected'); // Nothing is missing
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

    const prevBinId = activeBinId;
    const prevOperation = activeOperation;

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
    
    if (activeBinId !== prevBinId || activeOperation !== prevOperation) {
      if (activeBinId !== null && activeOperation !== null) await _sayBinAndOperation(activeBinId, activeOperation);
    }

    const items = await findItems(prompt, _onFoundItem);
    console.log(`Bin ID: ${activeBinId}, operation: ${activeOperation}, items: ${items}`);

    async function _onFoundItem(itemName:string) {
      if (activeBinId === null || activeOperation === null) { await _sayWhatIsMissing(activeBinId, activeOperation); return; }
      const transaction = _createTransaction(activeBinId, activeOperation, [itemName]);
      if (transaction) {
        const nextBinSet = processBinTransaction(transaction);
        setBinSet(nextBinSet);
      }
      await _sayItem(activeOperation, itemName);
    }
  } catch(e) {
    console.error('Error while generating response.', e);
  } finally {
    setPrompt('');
    setIsBusy(false);
  }
}