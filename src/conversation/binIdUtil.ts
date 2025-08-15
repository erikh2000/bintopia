const numberWords = ['zero', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine', 'ten', 'eleven', 'twelve', 
  'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy',
'eighty', 'ninety', 'hundred'];
const numberValues = [0,1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,30,40,50,60,70,80,90,100];

const unsupportedNumberWords = ['thousand', 'million', 'billion', 'trillion'];

// Some words that could be between number words that should be ignored.
const connectingWords = ['and', 'a', 'uh', 'um', 'or'];

/**
 * Parse an English bin identifier from speech transcription by recognizing number words.
 * Bin IDs from 0 to 999 are supported.
 *
 * Examples:
 * - "bin twelve" => 12
 * - "put in one hundred two" => 102
 * - "add to bin forty five please" => 45
 *
 * @param prompt Free-form text potentially containing number words as well as speech transcription junk.
 * @returns Bin ID value or -1 if no bin ID could be parsed.
 */
export function findBinId(prompt:string):number|null {
  const words = prompt.split(' ');
  let numberTotal = -1;
  let lastNumberValue = -1;
  for(let i = 0; i < words.length; i++) {
    const word = words[i].toLowerCase().trim();
    if (connectingWords.includes(word)) continue;
    if (unsupportedNumberWords.includes(word)) return -1; // Avoid interpreting other supported words around it as a bin ID.
    const numberI = numberWords.indexOf(word);
    if (numberI === -1) {
      if (numberTotal !== -1) return numberTotal;
      continue;
    }
    const numberValue = numberValues[numberI];
    
    // Check for invalid combinations of number values. Return -1 to avoid misinterpreting a bin ID.
    if (lastNumberValue !== -1) {
      if (numberValue === 100 && !(lastNumberValue > 0 && lastNumberValue < 10)) return -1;
      if (numberValue >= 20 && numberValue <= 99 && lastNumberValue !== 100) return -1;
      if (numberValue >= 1 && numberValue <= 9 && !(lastNumberValue >= 20 && lastNumberValue <= 100)) return -1;
      if (numberValue === 0) return -1;
    }
    lastNumberValue = numberValue;

    if (numberValue === 100 && numberTotal) { numberTotal *= 100; continue; }
    if (numberTotal === -1) numberTotal = 0;
    numberTotal += numberValue;
  }
  return numberTotal;
}