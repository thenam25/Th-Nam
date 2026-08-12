import { describe, it, expect } from 'vitest';
import {
  normalizeMediaPath,
  computeImageCandidateScores,
  findBestAssignment,
} from '../pptParser.js';

describe('normalizeMediaPath', () => {
  it('keeps ppt/media/ paths as-is', () => {
    expect(normalizeMediaPath('ppt/media/image1.png')).toBe('ppt/media/image1.png');
  });

  it('prefixes media/ paths with ppt/', () => {
    expect(normalizeMediaPath('media/image1.png')).toBe('ppt/media/image1.png');
  });

  it('converts bare filenames to ppt/media/', () => {
    expect(normalizeMediaPath('image1.png')).toBe('ppt/media/image1.png');
  });

  it('handles Windows backslash paths', () => {
    expect(normalizeMediaPath('ppt\\media\\image1.png')).toBe('ppt/media/image1.png');
  });

  it('strips ../ prefix then normalizes to ppt/media/', () => {
    // '../media/image1.png' → strip '../' → 'media/image1.png'
    // → starts with 'media/' → prefix 'ppt/' → 'ppt/media/image1.png'
    expect(normalizeMediaPath('../media/image1.png')).toBe('ppt/media/image1.png');
  });

  it('strips leading slash', () => {
    expect(normalizeMediaPath('/ppt/media/image1.png')).toBe('ppt/media/image1.png');
  });

  it('extracts filename from deeply nested paths', () => {
    expect(normalizeMediaPath('some/deep/path/image.png')).toBe('ppt/media/image.png');
  });
});

describe('findBestAssignment', () => {
  it('returns empty array for N=0', () => {
    expect(findBestAssignment([], 0, 3)).toEqual([]);
  });

  it('returns all -1 for M=0', () => {
    expect(findBestAssignment([[0, 0, 0]], 1, 0)).toEqual([-1]);
  });

  it('assigns each image to best candidate (greedy)', () => {
    // Image 0 prefers candidate 1 (score 100), Image 1 prefers candidate 0 (score 100)
    const scores = [
      [10, 100], // img 0: cand 0=10, cand 1=100
      [100, 10], // img 1: cand 0=100, cand 1=10
    ];
    expect(findBestAssignment(scores, 2, 2)).toEqual([1, 0]);
  });

  it('handles tie-breaking by sorting order (higher score first)', () => {
    const scores = [
      [50, 50],
      [30, 20],
    ];
    const result = findBestAssignment(scores, 2, 2);
    // Both should be assigned (2 imgs, 2 candidates)
    expect(result.filter((x) => x !== -1).length).toBe(2);
  });

  it('leaves unmatched images as -1', () => {
    // 3 images but only 1 candidate
    const scores = [
      [100],
      [50],
      [10],
    ];
    const result = findBestAssignment(scores, 3, 1);
    expect(result[0]).toBe(0); // best match gets it
    expect(result[1]).toBe(-1);
    expect(result[2]).toBe(-1);
  });
});

describe('computeImageCandidateScores', () => {
  const makeItem = (overrides: Record<string, unknown> = {}) => ({
    imgIdx: 0,
    visualColor: '',
    p: {},
    spatialText: '',
    cleanName: '',
    ...overrides,
  });

  it('returns N×M matrix of zeros for empty inputs', () => {
    const scores = computeImageCandidateScores([], []);
    expect(scores).toEqual([]);
  });

  it('gives higher score for color match', () => {
    const items = [makeItem({ visualColor: 'Máy vàng', cleanName: 'Máy cày vàng' })];
    const candidates = ['Máy cày màu vàng Yanmar'];
    const scores = computeImageCandidateScores(items, candidates);
    // Should have positive score due to yellow color match
    expect(scores[0][0]).toBeGreaterThan(0);
  });

  it('gives index proximity bonus for i === j', () => {
    const items = [
      makeItem({ imgIdx: 0 }),
      makeItem({ imgIdx: 1 }),
    ];
    const candidates = ['Cand A', 'Cand B'];
    const scores = computeImageCandidateScores(items, candidates);
    // i === j should get +10 bonus vs i !== j with same empty data
    expect(scores[0][0]).toBeGreaterThan(scores[0][1]);
    expect(scores[1][1]).toBeGreaterThan(scores[1][0]);
  });

  it('gives bonus for exact name match', () => {
    const items = [makeItem({ cleanName: 'Máy cày Yanmar EF393T' })];
    const candidates = ['Máy cày Yanmar EF393T'];
    const scores = computeImageCandidateScores(items, candidates);
    // Should have at least +150 for exact match +10 for index proximity
    expect(scores[0][0]).toBeGreaterThanOrEqual(160);
  });

  it('gives bonus for Gemini explicit candidate choice', () => {
    const items = [makeItem({ p: { matchedCandidateIndex: 1 } })];
    const candidates = ['Cand A', 'Cand B', 'Cand C'];
    const scores = computeImageCandidateScores(items, candidates);
    // cand 1 should get +120 from Gemini choice
    expect(scores[0][1]).toBeGreaterThan(scores[0][0]);
    expect(scores[0][1]).toBeGreaterThan(scores[0][2]);
  });
});
