// Because pausing should be very easy to signal, catch some other words that sound like it.
// Be careful about including words that might be items though.
const PAUSE_KEYWORDS = ['pause', 'paws', 'past', 'paused', 'cause', 'clause', 'laws', 'loss', `how's`];

export function isPausing(prompt:string):boolean {
  const word = prompt.toLowerCase().trim();
  if (word.indexOf(' ') !== -1) return false;
  return PAUSE_KEYWORDS.includes(word);
}

export function isResuming(prompt:string):boolean {
  return prompt.toLowerCase().trim() === 'resume';
}