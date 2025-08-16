import { isLlmConnected } from "@/llm/llmUtil";
import { Recognizer, setModelsBaseUrl } from "sl-web-speech";
import { IStringCallback } from "sl-web-speech/dist/types/callbacks";

let recognizer:Recognizer|null = null;

function _onStartSpeaking() {
  console.log("start speaking");
}

function _onStopSpeaking() {
  console.log("stop speaking");
}

export async function init(setPrompt:IStringCallback, onFinal:IStringCallback):Promise<boolean> {
  if (!isLlmConnected()) return false;

  const promise = new Promise<boolean>((resolve) => {

    function _onReady() {
      if (!recognizer) throw Error('Unexpected');
      recognizer.bindCallbacks(setPrompt, _onStartSpeaking, _onStopSpeaking, onFinal);
      resolve(true);
    }

    setModelsBaseUrl('/speech-models/');
    recognizer = new Recognizer(_onReady);
  });

  return promise;
}

export function mute() {
  if (!recognizer) throw Error('Unexpected');
  recognizer.mute();
}

export function unmute() {
  if (!recognizer) throw Error('Unexpected');
  recognizer.unmute();
}

export function toggleMute(isMuted:boolean, setIsMuted:Function) {
  if (isMuted) {
    unmute();
  } else {
    mute();
  }
  setIsMuted(!isMuted);
}