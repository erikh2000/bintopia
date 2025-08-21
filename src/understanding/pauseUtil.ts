const PAUSE_KEYWORDS = ['sleep'];

export function isPausing(prompt:string):boolean {
  const word = prompt.toLowerCase().trim();
  return PAUSE_KEYWORDS.includes(word);
}

const RESUME_KEYWORDS = ['wake'];

export function isResuming(prompt:string):boolean {
  return RESUME_KEYWORDS.includes(prompt.toLowerCase().trim());
}