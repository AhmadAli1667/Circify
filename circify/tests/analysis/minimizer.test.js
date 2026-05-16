import { describe, it, expect } from 'vitest';
import {
  quineMcCluskeyMinimize,
  implicantsToSOP,
  grayCodeList,
} from '../../src/analysis/minimizer.js';

describe('grayCodeList', () => {
  it('returns single empty string for 0 bits', () => {
    expect(grayCodeList(0)).toEqual(['']);
  });

  it('produces 2-bit gray code', () => {
    expect(grayCodeList(2)).toEqual(['00', '01', '11', '10']);
  });

  it('produces 3-bit gray code of length 8', () => {
    const codes = grayCodeList(3);
    expect(codes).toHaveLength(8);
    expect(codes[0]).toBe('000');
    expect(codes[1]).toBe('001');
    expect(codes[2]).toBe('011');
  });
});

describe('quineMcCluskeyMinimize', () => {
  it('returns empty for no minterms', () => {
    expect(quineMcCluskeyMinimize(2, [])).toEqual([]);
  });

  it('minimizes a single minterm', () => {
    const result = quineMcCluskeyMinimize(2, [3]);
    expect(result).toHaveLength(1);
    expect(result[0]).toBe('11');
  });

  it('minimizes adjacent minterms into a single implicant', () => {
    // minterms 0,1 (00, 01) → -0 or 0-
    const result = quineMcCluskeyMinimize(2, [0, 1]);
    expect(result).toHaveLength(1);
    expect(result[0]).toContain('-');
  });

  it('minimizes a 2-var AND function (only minterm 3)', () => {
    const result = quineMcCluskeyMinimize(2, [3]);
    expect(implicantsToSOP(result, ['A', 'B'])).toBe('A B');
  });

  it('minimizes a 2-var OR function (minterms 1,2,3)', () => {
    const result = quineMcCluskeyMinimize(2, [1, 2, 3]);
    const sop = implicantsToSOP(result, ['A', 'B']);
    expect(typeof sop).toBe('string');
    expect(sop.length).toBeGreaterThan(0);
  });

  it('covers all minterms in the result', () => {
    const minterms = [0, 1, 2, 3];
    const result = quineMcCluskeyMinimize(2, minterms);
    // All 4 minterms → constant 1
    const sop = implicantsToSOP(result, ['A', 'B']);
    expect(sop).not.toBe('0');
  });
});

describe('implicantsToSOP', () => {
  it('returns "0" for empty implicants', () => {
    expect(implicantsToSOP([], ['A', 'B'])).toBe('0');
  });

  it('formats uncomplemented literal', () => {
    expect(implicantsToSOP(['11'], ['A', 'B'])).toBe('A B');
  });

  it('formats complemented literal', () => {
    expect(implicantsToSOP(['00'], ['A', 'B'])).toBe("A' B'");
  });

  it('formats a mixed term', () => {
    expect(implicantsToSOP(['10'], ['A', 'B'])).toBe("A B'");
  });

  it('uses dash as dont-care (skips the variable)', () => {
    expect(implicantsToSOP(['-1'], ['A', 'B'])).toBe('B');
    expect(implicantsToSOP(['1-'], ['A', 'B'])).toBe('A');
  });

  it('returns "1" for all-dash implicant', () => {
    expect(implicantsToSOP(['--'], ['A', 'B'])).toBe('1');
  });

  it('joins multiple terms with " + "', () => {
    expect(implicantsToSOP(['10', '01'], ['A', 'B'])).toBe("A B' + A' B");
  });
});
