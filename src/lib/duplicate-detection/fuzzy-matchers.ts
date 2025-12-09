/**
 * Fuzzy matching algorithms for near-duplicate detection
 * Uses multiple algorithms to catch typos, variations, and similar names
 */

import { DuplicateThresholds } from './config';

/**
 * Levenshtein distance (edit distance)
 * Returns number of single-character edits needed to transform str1 into str2
 */
export function levenshteinDistance(str1: string, str2: string): number {
  const m = str1.length;
  const n = str2.length;

  // Create distance matrix
  const dp: number[][] = Array(m + 1)
    .fill(null)
    .map(() => Array(n + 1).fill(0));

  // Initialize first column and row
  for (let i = 0; i <= m; i++) dp[i][0] = i;
  for (let j = 0; j <= n; j++) dp[0][j] = j;

  // Fill matrix
  for (let i = 1; i <= m; i++) {
    for (let j = 1; j <= n; j++) {
      if (str1[i - 1] === str2[j - 1]) {
        dp[i][j] = dp[i - 1][j - 1];
      } else {
        dp[i][j] = Math.min(
          dp[i - 1][j] + 1,     // deletion
          dp[i][j - 1] + 1,     // insertion
          dp[i - 1][j - 1] + 1  // substitution
        );
      }
    }
  }

  return dp[m][n];
}

/**
 * Jaro-Winkler similarity
 * Returns value between 0 (completely different) and 1 (identical)
 * Better for short strings like names
 */
export function jaroWinklerSimilarity(str1: string, str2: string): number {
  // Jaro similarity
  const jaroSim = jaroSimilarity(str1, str2);

  // Find common prefix (up to 4 characters)
  let prefix = 0;
  const maxPrefix = Math.min(4, str1.length, str2.length);
  for (let i = 0; i < maxPrefix; i++) {
    if (str1[i] === str2[i]) {
      prefix++;
    } else {
      break;
    }
  }

  // Jaro-Winkler uses prefix scaling factor (p = 0.1)
  const p = 0.1;
  return jaroSim + prefix * p * (1 - jaroSim);
}

function jaroSimilarity(str1: string, str2: string): number {
  if (str1 === str2) return 1.0;
  if (str1.length === 0 || str2.length === 0) return 0.0;

  const matchWindow = Math.max(str1.length, str2.length) / 2 - 1;

  const str1Matches = new Array(str1.length).fill(false);
  const str2Matches = new Array(str2.length).fill(false);

  let matches = 0;
  let transpositions = 0;

  // Find matches
  for (let i = 0; i < str1.length; i++) {
    const start = Math.max(0, i - matchWindow);
    const end = Math.min(i + matchWindow + 1, str2.length);

    for (let j = start; j < end; j++) {
      if (str2Matches[j] || str1[i] !== str2[j]) continue;
      str1Matches[i] = true;
      str2Matches[j] = true;
      matches++;
      break;
    }
  }

  if (matches === 0) return 0.0;

  // Count transpositions
  let k = 0;
  for (let i = 0; i < str1.length; i++) {
    if (!str1Matches[i]) continue;
    while (!str2Matches[k]) k++;
    if (str1[i] !== str2[k]) transpositions++;
    k++;
  }

  return (
    (matches / str1.length +
      matches / str2.length +
      (matches - transpositions / 2) / matches) /
    3
  );
}

/**
 * N-gram (trigram) Jaccard coefficient
 * Returns value between 0 and 1
 * Good for catching character-level similarities
 */
export function ngramJaccardSimilarity(
  str1: string,
  str2: string,
  n: number = 3
): number {
  const ngrams1 = getNgrams(str1.toLowerCase(), n);
  const ngrams2 = getNgrams(str2.toLowerCase(), n);

  if (ngrams1.length === 0 && ngrams2.length === 0) return 1.0;
  if (ngrams1.length === 0 || ngrams2.length === 0) return 0.0;

  const set1 = new Set(ngrams1);
  const set2 = new Set(ngrams2);

  const intersection = [...set1].filter(gram => set2.has(gram));
  const union = new Set([...set1, ...set2]);

  return intersection.length / union.size;
}

function getNgrams(str: string, n: number): string[] {
  const ngrams: string[] = [];
  const paddedStr = ' '.repeat(n - 1) + str + ' '.repeat(n - 1);

  for (let i = 0; i <= paddedStr.length - n; i++) {
    ngrams.push(paddedStr.slice(i, i + n));
  }

  return ngrams;
}

/**
 * Soundex phonetic algorithm
 * Converts names to phonetic representation
 * Good for matching names that sound similar
 */
export function soundex(str: string): string {
  const s = str.toUpperCase().replace(/[^A-Z]/g, '');
  if (s.length === 0) return '0000';

  const firstLetter = s[0];

  // Soundex mapping
  const map: { [key: string]: string } = {
    B: '1', F: '1', P: '1', V: '1',
    C: '2', G: '2', J: '2', K: '2', Q: '2', S: '2', X: '2', Z: '2',
    D: '3', T: '3',
    L: '4',
    M: '5', N: '5',
    R: '6',
  };

  let code = firstLetter;
  let prevCode = map[firstLetter] || '0';

  for (let i = 1; i < s.length && code.length < 4; i++) {
    const char = s[i];
    const charCode = map[char] || '0';

    // Skip vowels and H, W, Y
    if (charCode === '0') {
      prevCode = '0';
      continue;
    }

    // Skip if same as previous code
    if (charCode !== prevCode) {
      code += charCode;
      prevCode = charCode;
    }
  }

  // Pad with zeros if needed
  return code.padEnd(4, '0');
}

/**
 * Metaphone phonetic algorithm
 * More sophisticated than Soundex, better for non-English names
 */
export function metaphone(str: string): string {
  // Simplified metaphone implementation
  const s = str.toUpperCase().replace(/[^A-Z]/g, '');
  if (s.length === 0) return '';

  let result = '';

  // Drop duplicates
  let deduplicated = s[0];
  for (let i = 1; i < s.length; i++) {
    if (s[i] !== s[i - 1]) {
      deduplicated += s[i];
    }
  }

  // Apply metaphone rules (simplified)
  for (let i = 0; i < deduplicated.length; i++) {
    const char = deduplicated[i];
    const next = deduplicated[i + 1];

    switch (char) {
      case 'A':
      case 'E':
      case 'I':
      case 'O':
      case 'U':
        if (i === 0) result += char;
        break;
      case 'B':
        if (i === deduplicated.length - 1 && deduplicated[i - 1] === 'M') break;
        result += 'B';
        break;
      case 'C':
        if (next === 'H') {
          result += 'X';
          i++;
        } else if (next === 'I' || next === 'E') {
          result += 'S';
        } else {
          result += 'K';
        }
        break;
      case 'D':
        result += 'T';
        break;
      case 'G':
        if (next === 'H') {
          i++;
        }
        result += 'K';
        break;
      case 'H':
        if (i > 0 && 'AEIOU'.includes(deduplicated[i - 1])) break;
        result += 'H';
        break;
      case 'K':
        if (i > 0 && deduplicated[i - 1] === 'C') break;
        result += 'K';
        break;
      case 'P':
        if (next === 'H') {
          result += 'F';
          i++;
        } else {
          result += 'P';
        }
        break;
      case 'Q':
        result += 'K';
        break;
      case 'S':
        if (next === 'H') {
          result += 'X';
          i++;
        } else {
          result += 'S';
        }
        break;
      case 'T':
        if (next === 'H') {
          result += '0';
          i++;
        } else {
          result += 'T';
        }
        break;
      case 'V':
        result += 'F';
        break;
      case 'W':
      case 'Y':
        if (i > 0 && 'AEIOU'.includes(deduplicated[i - 1])) {
          result += char;
        }
        break;
      case 'X':
        result += 'KS';
        break;
      case 'Z':
        result += 'S';
        break;
      default:
        result += char;
    }
  }

  return result;
}

/**
 * Combined name matching with configurable thresholds
 */
export interface NameMatchResult {
  isMatch: boolean;
  confidence: number; // 0-1
  methods: {
    levenshtein: { distance: number; threshold: number; passed: boolean };
    jaroWinkler: { similarity: number; threshold: number; passed: boolean };
    ngram: { similarity: number; threshold: number; passed: boolean };
    soundex: { code1: string; code2: string; match: boolean };
  };
}

export function matchNames(
  name1: string,
  name2: string,
  thresholds: DuplicateThresholds
): NameMatchResult {
  const normalized1 = name1.toLowerCase().trim();
  const normalized2 = name2.toLowerCase().trim();

  // If exactly the same, return 100% match
  if (normalized1 === normalized2) {
    return {
      isMatch: true,
      confidence: 1.0,
      methods: {
        levenshtein: { distance: 0, threshold: 0, passed: true },
        jaroWinkler: { similarity: 1.0, threshold: thresholds.jaroWinklerMin, passed: true },
        ngram: { similarity: 1.0, threshold: thresholds.ngramJaccardMin, passed: true },
        soundex: { code1: soundex(normalized1), code2: soundex(normalized2), match: true },
      },
    };
  }

  const maxLength = Math.max(normalized1.length, normalized2.length);
  const levenshteinThreshold = maxLength <= 10 ? 3 : 5;

  const levDist = levenshteinDistance(normalized1, normalized2);
  const jaroWink = jaroWinklerSimilarity(normalized1, normalized2);
  const ngramSim = ngramJaccardSimilarity(normalized1, normalized2);
  const soundex1 = soundex(normalized1);
  const soundex2 = soundex(normalized2);

  const levPassed = levDist <= levenshteinThreshold;
  const jaroPassed = jaroWink >= thresholds.jaroWinklerMin;
  const ngramPassed = ngramSim >= thresholds.ngramJaccardMin;
  const soundexPassed = soundex1 === soundex2;

  // Calculate confidence score (weighted average)
  const weights = {
    levenshtein: 0.3,
    jaroWinkler: 0.3,
    ngram: 0.3,
    soundex: 0.1,
  };

  // Normalize Levenshtein to 0-1 scale
  const levNormalized = Math.max(0, 1 - levDist / maxLength);

  const confidence =
    levNormalized * weights.levenshtein +
    jaroWink * weights.jaroWinkler +
    ngramSim * weights.ngram +
    (soundexPassed ? 1 : 0) * weights.soundex;

  // Match if at least 2 methods pass OR high confidence
  const passedCount = [levPassed, jaroPassed, ngramPassed].filter(Boolean).length;
  const isMatch = passedCount >= 2 || (soundexPassed && passedCount >= 1) || confidence >= 0.85;

  return {
    isMatch,
    confidence,
    methods: {
      levenshtein: { distance: levDist, threshold: levenshteinThreshold, passed: levPassed },
      jaroWinkler: { similarity: jaroWink, threshold: thresholds.jaroWinklerMin, passed: jaroPassed },
      ngram: { similarity: ngramSim, threshold: thresholds.ngramJaccardMin, passed: ngramPassed },
      soundex: { code1: soundex1, code2: soundex2, match: soundexPassed },
    },
  };
}
