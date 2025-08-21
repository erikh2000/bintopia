import ConversationEvent from "@/conversation/types/ConversationEvent";
import ConversationEventType from "./types/ConversationEventType";
import TransactionEvent from "./types/TransactionEvent";
import { estimateSpeechDuration } from "./speechUtil";
import OperationType from "@/transactions/types/OperationType";
import SetActiveBinOperationEvent from "./types/SetActiveBinOperationEvent";
import MissingBinOperationEvent from "./types/MissingBinOperationEvent";

enum CompressionLevel {
  UNCOMPRESSED = 0,
  PARTIAL = 1,
  MINIMAL = 2,
  OMITTED = 3,
  UNEXPECTED_ERROR = 4
}

type SummaryPart = {
  event:ConversationEvent,
  summaryText:string,
  speechDuration:number,
  compressionLevel:number
}

const MAX_AGE_MS = 10 * 1000;
function _filterOldEvents(events:ConversationEvent[]):ConversationEvent[] {
  const now = Date.now();
  return events.filter(event => (now - event.timestamp) <= MAX_AGE_MS); 
}

function _filterEventsOfType(events:ConversationEvent[], eventType:ConversationEventType):ConversationEvent[] {
  return events.filter(e => e.type !== eventType);
}

const MARKED_FOR_DELETION = -1;
function _filterEventsMarkedForDeletion(events:ConversationEvent[]):ConversationEvent[] {
  return events.filter(e => (e as any).type !== MARKED_FOR_DELETION);
}

function _combineItems(firstItems:string[], secondItems:string[]):string[] {
  const combined = [...firstItems];
  secondItems.forEach(item => { 
    if (!combined.includes(item)) combined.push(item);
  })
  return combined;
}

function _consolidateTransactions(events:ConversationEvent[]):ConversationEvent[] {
  for(let eventI = events.length - 1; eventI > 0; --eventI) {
    if (events[eventI].type !== ConversationEventType.TRANSACTION) continue;
    const transaction:TransactionEvent = events[eventI] as TransactionEvent;
    for(let beforeEventI = 0; beforeEventI < eventI; ++beforeEventI) {
      if (events[beforeEventI].type !== ConversationEventType.TRANSACTION) continue;
      const beforeTransaction:TransactionEvent = events[beforeEventI] as TransactionEvent;
      if (beforeTransaction.tx.binId !== transaction.tx.binId || beforeTransaction.tx.operation !== transaction.tx.operation) continue;
      transaction.tx.items = _combineItems(transaction.tx.items, beforeTransaction.tx.items);
      (beforeTransaction as any).type = MARKED_FOR_DELETION;
    }
  }
  return _filterEventsMarkedForDeletion(events);
}

function _filterRedundantlyDescribedByTransactionEvents(events:ConversationEvent[]):ConversationEvent[] {
  let startTransactionRangeI = 0;
  for(let eventI = 0; eventI < events.length; ++eventI) {
    const event = events[eventI];
    if (event.type !== ConversationEventType.TRANSACTION) continue;
    for(let beforeEventI = startTransactionRangeI; beforeEventI < eventI; ++beforeEventI) {
      const beforeEvent:ConversationEvent = events[beforeEventI];
      if (beforeEvent.type === ConversationEventType.SET_ACTIVE_BIN_OPERATION) {
        (beforeEvent as any).type = MARKED_FOR_DELETION;
      }
    }
    startTransactionRangeI = eventI + 1;
  }
  return _filterEventsMarkedForDeletion(events);
}

const RESUME_PHRASES = ['Back to work!', `Let's go!`, `Yeah!`, `I'm ready!`, 'Here to help!'];
function _getResumeText():string {
  const phraseI = Math.floor(Math.random() * RESUME_PHRASES.length);
  return RESUME_PHRASES[phraseI];
}

function _getItemListText(items:string[]):string {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  let concat = '';
  for(let i = 0; i < items.length; ++i) {
    if (i > 0) concat += ', ';
    if (i === items.length - 1) concat += 'and ';
    concat += items[i];
  }
  return concat;
}

function _getPartialItemListText(items:string[]):string {
  if (items.length === 1) return items[0];
  if (items.length === 2) return `${items[0]} and ${items[1]}`;
  const otherItemCount = items.length - 1;
  return `${items[0]} and ${otherItemCount} other items`;
}

function _getMinimalItemListText(items:string[]):string {
  return items.length === 1 ? '1 item' : `${items.length} items`;
}

function _getTransactionSummaryText(event:TransactionEvent, compressionLevel:CompressionLevel):string {
  if (event.tx.operation === OperationType.CLEAR_BINSET) return 'Cleared bins';
  const operationVerb = event.tx.operation === OperationType.ADD_TO_BIN ? 'added' : 'removed';
  switch(compressionLevel) {
    case CompressionLevel.UNCOMPRESSED:
    return `${_getItemListText(event.tx.items)} ${operationVerb}.`;
    
    case CompressionLevel.PARTIAL:
    return `${_getPartialItemListText(event.tx.items)} ${operationVerb}.`;

    case CompressionLevel.MINIMAL:
    return `${_getMinimalItemListText(event.tx.items)} ${operationVerb}.`;

    default: throw Error('Unexpected');
  }
}

function _getSetActiveBinOperationSummaryText(event:SetActiveBinOperationEvent, compressionLevel:CompressionLevel):string {
  switch(compressionLevel) {
    case CompressionLevel.UNCOMPRESSED:
      if (event.operation) {
        const operationText = event.operation === OperationType.ADD_TO_BIN ? 'adding to ' : 'removing from ';
        if (event.binId === null) return `Which bin number are we ${operationText}?`;
        return `${operationText} bin number ${event.binId}.`;
      }
      if (event.binId === null) throw Error('Unexpected');
    return `Are we adding or removing items from bin number ${event.binId}?`

    case CompressionLevel.PARTIAL:
      if (event.operation) {
        const operationText = event.operation === OperationType.ADD_TO_BIN ? 'adding to ' : 'removing from ';
        if (event.binId === null) return `Which bin number are we ${operationText}?`;
        return `${operationText} number ${event.binId}.`;
      }
      if (event.binId === null) throw Error('Unexpected');
    return `Adding or removing from number ${event.binId}?`;

    case CompressionLevel.MINIMAL:
      if (event.operation) {
        const operationText = event.operation === OperationType.ADD_TO_BIN ? 'adding to ' : 'removing from ';
        if (event.binId === null) return `Which bin number?`;
        return `${operationText} number ${event.binId}.`;
      }
      if (event.binId === null) throw Error('Unexpected');
    return `Adding or removing?`;

    default: throw Error('Unexpected');
  }
}

function _getMissingBinOperationSummaryText(event:MissingBinOperationEvent, compressionLevel:CompressionLevel):string {
  switch(compressionLevel) {
    case CompressionLevel.UNCOMPRESSED:
      if (event.operation) {
        const operationText = event.operation === OperationType.ADD_TO_BIN ? 'adding to ' : 'removing from ';
        return `Which bin number are we ${operationText}?`;
      }
      if (event.binId) return `Are we adding or removing items from bin number ${event.binId}?`
    return `Are we adding or removing items? And which bin number?`;
    
    case CompressionLevel.PARTIAL:
      if (event.operation) {
        const operationText = event.operation === OperationType.ADD_TO_BIN ? 'adding to ' : 'removing from ';
        return `Which bin number are we ${operationText}?`;
      }
      if (event.binId) return `Adding or removing from number ${event.binId}?`
    return `Adding or removing? And which bin number?`;

    case CompressionLevel.MINIMAL:
      if (event.operation) return `Which bin number?`;
      if (event.binId) return `Adding or removing?`
    return `Adding or removing? Which bin number?`;

    default: throw Error('Unexpected');
  }
}

function _getSummaryTextForEvent(event:ConversationEvent, compressionLevel:CompressionLevel):string {
  if (compressionLevel === CompressionLevel.OMITTED) return '';
  switch(event.type) {
    case ConversationEventType.TRANSACTION: return _getTransactionSummaryText(event as TransactionEvent, compressionLevel);
    case ConversationEventType.SET_ACTIVE_BIN_OPERATION: return _getSetActiveBinOperationSummaryText(event as SetActiveBinOperationEvent, compressionLevel);
    case ConversationEventType.MISSING_BIN_OPERATION: return _getMissingBinOperationSummaryText(event as MissingBinOperationEvent, compressionLevel);
    case ConversationEventType.PAUSE: case ConversationEventType.RESUME: default: 
    throw Error('Unexpected event type for summarization: ' + event.type);
  }
}

function _summarizeEvent(event:ConversationEvent, compressionLevel:CompressionLevel):SummaryPart {
  const summaryText = _getSummaryTextForEvent(event, compressionLevel);
  const speechDuration = estimateSpeechDuration(summaryText);
  return { event, summaryText, speechDuration, compressionLevel }
}

function _calcPartsSpeechDuration(parts:SummaryPart[]):number {
  let total = 0;
  parts.forEach(p => total += p.speechDuration);
  return total;
}

function _combinePartSummaries(parts:SummaryPart[]):string {
  return parts.map(p => p.summaryText).join(' ').trim();
}

function _getOnePhraseSummary(events:ConversationEvent[]):string {
  if (events.some(e => e.type === ConversationEventType.MISSING_BIN_OPERATION)) return 'Need info.';
  return 'Okay.';
}

export function summarizeEvents(events:ConversationEvent[], maxSummaryDurationMs:number):string {
  events = _filterOldEvents(events);
  events = _filterEventsOfType(events, ConversationEventType.PAUSE);

  // If a single resume event, it's worth summarizing. Otherwise, ignore.
  if (events.length === 1 && events[0].type === ConversationEventType.RESUME) return _getResumeText();
  events = _filterEventsOfType(events, ConversationEventType.RESUME);

  events = _consolidateTransactions(events);
  events = _filterRedundantlyDescribedByTransactionEvents(events);
  
  const parts:SummaryPart[] = events.map(event => _summarizeEvent(event, CompressionLevel.UNCOMPRESSED));
  
  let compressionLevel = CompressionLevel.UNCOMPRESSED;
  while(_calcPartsSpeechDuration(parts) > maxSummaryDurationMs) {
    // If all parts are already at the current compression level, then increase the compression level.
    if (parts.every(p => p.compressionLevel === compressionLevel)) ++compressionLevel;

    if (compressionLevel === CompressionLevel.UNEXPECTED_ERROR) throw Error('Unexpected'); // Since "omitted" compression sets duration to zero, flow should never get here.

    // Find part associated with oldest event that is not at current compression level and compress it further.
    for(let partI = 0; partI < parts.length; ++partI) {
      const part = parts[partI];
      if (part.compressionLevel < compressionLevel) {
        const newPart = _summarizeEvent(part.event, compressionLevel);
        parts[partI] = newPart;
        break;
      }
    }

    throw Error('Unexpected'); // Should always be able to find a part to compress at a new compression level.
  }

  const summaryText = _combinePartSummaries(parts);
  return (!summaryText.length) ? _getOnePhraseSummary(events) : summaryText;
}