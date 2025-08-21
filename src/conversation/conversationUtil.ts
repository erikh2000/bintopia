import Event from "@/conversation/types/ConversationEvent";
import { Recognizer, setModelsBaseUrl } from "sl-web-speech";
import { IStringCallback } from "sl-web-speech/dist/types/callbacks";
import { say, stopSpeaking } from "./speechUtil";
import { summarizeEvents } from "./summaryUtil";
import ConversationState from "@/conversation/types/ConversationState";

let theUnprocessedEvents:Event[] = [];
let theRecognizer:Recognizer|null = null;
let theMaxSummaryDurationMs:number = 10 * 1000;
let theConversationState:ConversationState = ConversationState.INITIALIZING;
let theOnConversationStateChange:ConversationStateChangeCallback = () => {};

export type ConversationStateChangeCallback = (newState:ConversationState) => void;

function _setConversationState(newState:ConversationState) {
  if (theConversationState === newState) return;
  theConversationState = newState;
  theOnConversationStateChange(newState);
}

function _onUserStartSpeaking() {
  if (theConversationState === ConversationState.PAUSED) return;
  _setConversationState(ConversationState.USER_SPEAKING, );
}

export async function speakSummaryOfUnprocessedEvents() {
  if (theUnprocessedEvents.length === 0 || theConversationState !== ConversationState.IDLE) return;
  if (!theRecognizer) throw Error('Unexpected');
  const summaryText = summarizeEvents(theUnprocessedEvents, theMaxSummaryDurationMs);
  theUnprocessedEvents = [];

  _setConversationState(ConversationState.ASSISTANT_SPEAKING);
  try {
    theRecognizer.mute();
    await say(summaryText)
  } finally {
    theRecognizer.unmute();
    _setConversationState(ConversationState.IDLE);
  }
}

function _onUserStopSpeaking() {
  if (theConversationState !== ConversationState.USER_SPEAKING) return;
  _setConversationState(ConversationState.IDLE);
  speakSummaryOfUnprocessedEvents();
}

export function setMaxSummaryDuration(maxSummaryDurationMs:number) {
  theMaxSummaryDurationMs = maxSummaryDurationMs;
}

export async function initConversation(onPartial:IStringCallback, onFinal:IStringCallback, 
    onConversationStateChange:(newState:ConversationState) => void):Promise<boolean> {
  if (theConversationState !== ConversationState.INITIALIZING) throw Error('Conversation already initialized');
  
  theOnConversationStateChange = onConversationStateChange;
  const promise = new Promise<boolean>((resolve) => {

    function _onReady() {
      if (!theRecognizer) throw Error('Unexpected');
      theRecognizer.bindCallbacks(onPartial, _onUserStartSpeaking, _onUserStopSpeaking, onFinal);
      theRecognizer.unmute();
      _setConversationState(ConversationState.IDLE);
      resolve(true);
    }

    setModelsBaseUrl('/speech-models/');
    try {
      theRecognizer = new Recognizer(_onReady);
    } catch(e) {
      console.error('Error while initializing speech recognizer.', e);
      _setConversationState(ConversationState.FATAL_ERROR);
      resolve(false);
    }
  });
  return promise;
}

export function addConversationEvent(event:Event) {
  theUnprocessedEvents.push(event);
}

export function clearUnprocessedEvents() {
  theUnprocessedEvents = [];
}

export async function pauseConversation() {
  if (theConversationState === ConversationState.PAUSED) return;
  if (!theRecognizer) throw Error('Unexpected');
  stopSpeaking();
  _setConversationState(ConversationState.PAUSED);
  theRecognizer.mute();
  await say('sleeping');
  theRecognizer.unmute(); // Need to be listening for "resume".
  clearUnprocessedEvents(); // user will likely not want to hear information when resuming.
}

export function resumeConversation() {
  if (theConversationState !== ConversationState.PAUSED) return;
  if (theRecognizer) theRecognizer.unmute();
  _setConversationState(ConversationState.IDLE);
}

export function isPaused():boolean {
  return theConversationState === ConversationState.PAUSED;
}
