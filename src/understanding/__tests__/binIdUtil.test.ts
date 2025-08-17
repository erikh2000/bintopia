import { findBinId } from "@/understanding/binIdUtil";

describe('bindIdUtil', () => {
  describe('findBinId()', () => {
    it('returns -1 for empty string', () => {
      expect(findBinId('')).toBe(-1);
    });

    it('returns -1 for text with no bin IDs', () => {
      expect(findBinId('add items to the bin')).toBe(-1);
    });

    it('returns bin ID in text by itself', () => {
      expect(findBinId('twelve')).toBe(12);
    });

    it('returns bin ID at start of text', () => {
      expect(findBinId('twelve items added')).toBe(12);
    });

    it('returns bin ID in middle of text', () => {
      expect(findBinId('add to bin twelve now')).toBe(12);
    });

    it('returns first bin ID when two different bin IDs are in the text', () => {
      expect(findBinId('bin five and then bin seven')).toBe(5);
    });

    it('returns bin ID of 0', () => {
      expect(findBinId('zero')).toBe(0);
    });

    it('returns bin ID of 10', () => {
      expect(findBinId('ten')).toBe(10);
    });

    it('returns bin ID of 11', () => {
      expect(findBinId('eleven')).toBe(11);
    });

    it('returns bin ID of 19', () => {
      expect(findBinId('nineteen')).toBe(19);
    });

    it('returns bin ID of 20', () => {
      expect(findBinId('twenty')).toBe(20);
    });

    it('returns bin ID of 31', () => {
      expect(findBinId('thirty one')).toBe(31);
    });

    it('returns bin ID of 99', () => {
      expect(findBinId('ninety nine')).toBe(99);
    });

    it('returns bin ID of 100', () => {
      expect(findBinId('one hundred')).toBe(100);
    });

    it('returns bin ID of 205', () => {
      expect(findBinId('two hundred five')).toBe(205);
    });

    it('returns bin ID of 678', () => {
      expect(findBinId('six hundred seventy eight')).toBe(678);
    });

    it('returns bin ID of 999', () => {
      expect(findBinId('nine hundred ninety nine')).toBe(999);
    });

    it('returns -1 for "thousand" which is not supported', () => {
      expect(findBinId('one thousand')).toBe(-1);
      expect(findBinId('two thousand and five')).toBe(-1);
    });

    it('returns bin ID for transcript containing one connecting word between number words', () => {
      // Contract: allow standard English connecting word "and"
      expect(findBinId('one hundred and five')).toBe(105);
      expect(findBinId('twenty and one')).toBe(21);
    });

    it('returns bin ID for transcript containing two connecting words between number words', () => {
      expect(findBinId('one hundred and uh five')).toBe(105);
      expect(findBinId('thirty and um one')).toBe(31);
    });

    it('returns -1 when "hundred" follows a non 1–9 number word', () => {
      expect(findBinId('twenty hundred')).toBe(-1);
    });

    it('returns -1 when a tens word follows a number that is not "hundred"', () => {
      expect(findBinId('one thirty')).toBe(-1);
    });

    it('returns -1 when a unit (1–9) follows a number that is not tens or hundred', () => {
      expect(findBinId('ten five')).toBe(-1);
    });

    it('returns -1 when zero appears after number parsing has started', () => {
      expect(findBinId('one zero')).toBe(-1);
    });

    it('returns -1 when "hundred" follows a non 1–9 number word with a connecting word', () => {
      expect(findBinId('twenty and hundred')).toBe(-1);
    });

    it('returns -1 when a tens word follows a number that is not "hundred" with a connecting word', () => {
      expect(findBinId('one and thirty')).toBe(-1);
    });

    it('returns -1 when a unit (1–9) follows a number that is not tens or hundred with a connecting word', () => {
      expect(findBinId('ten and five')).toBe(-1);
    });

    it('returns -1 when zero appears after number parsing has started with a connecting word', () => {
      expect(findBinId('one and zero')).toBe(-1);
    });
  });
});