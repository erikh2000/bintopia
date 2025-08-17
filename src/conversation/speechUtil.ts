// Don't add any dependencies to state from other modules.

const DEFAULT_SPEECH_RATE = 1;

let theSpeechRate = DEFAULT_SPEECH_RATE;

export function setSpeechRate(nextRate:number) {
  theSpeechRate = nextRate;
}

export async function say(text:string):Promise<void> {
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.rate = theSpeechRate;
  return new Promise((resolve, reject) => {
    utterance.onend = () => resolve();
    utterance.onerror = (e) => reject(e);
    window.speechSynthesis.speak(utterance);
  });
}

export function stopSpeaking() {
  window.speechSynthesis.cancel();
}

type PunctuationPause = { punctuation:string, pauseMSecs:number };
const PUNCTUATION_PAUSES:PunctuationPause[] = [ // Impossible to get these perfect, because voices/implementations vary.
  { punctuation:',', pauseMSecs:300 },
  { punctuation:';', pauseMSecs:300 },
  { punctuation:'...', pauseMSecs:300 },
  { punctuation:'.', pauseMSecs:400 },
  { punctuation:':', pauseMSecs:400 },
  { punctuation:'!', pauseMSecs:500 },
  { punctuation:'?', pauseMSecs:500 }
];

// The slowdown rate is inversely proportional to the speech rate, which can be between .1 and 10.
function _getSlowDownRate(speechRate:number):number {
  return 1 / speechRate;
}

/* This seems to average around 15% error. It's good enough, but if you need better accuracy later:
  * Have browser/voice-specific settings.
  * Break down words to syllables (consonant-vowel pairs) and estimate at average syllables/minute.
  * Adjust estimation in real time by measuring actual duration of spoken text and setting a "fudge factor" ratio that is multiplied by future estimates.
*/
export function estimateSpeechDuration(text:string):number {
  let totalMSecs = 0;
  const words:string[] = text.split(' ');
  const avgWordsPerMin = 180 * theSpeechRate;
  const msecsPerWord = 60000 / avgWordsPerMin;
  totalMSecs = words.length * msecsPerWord;

  // Add pauses for words ending in punctuation.
  const slowdownRate = _getSlowDownRate(theSpeechRate);
  for(let wordI = 0; wordI < words.length; ++wordI) {
    if (wordI === words.length - 1) break; // No pause after last word.
    const word = words[wordI];
    const pauseInfo = PUNCTUATION_PAUSES.find(p => word.endsWith(p.punctuation));
    if (!pauseInfo) continue;
    totalMSecs += (pauseInfo.pauseMSecs * slowdownRate);
  }

  return totalMSecs;
}