import assert from 'assert';
import { QuoteVerifier } from '../server/src/services/review/quoteVerifier.js';

console.log('Testing QuoteVerifier Suite (Rule 6.5)...');

const sourceText = `Section 5. Confidentiality Obligations.
Each Party agrees to hold the other Party's Confidential Information in strict confidence and shall not disclose such Confidential Information to any third party without express written permission. The confidentiality obligations under this Section shall survive for three (3) years following termination.`;

const dummyChunks = [
  {
    id: 'chunk_101',
    pageStart: 2,
    section: 'Section 5. Confidentiality Obligations',
    text: sourceText,
  },
];

const test1 = QuoteVerifier.verifyQuote(
  'Each Party agrees to hold the other Party\'s Confidential Information in strict confidence',
  sourceText,
  dummyChunks
);
assert.strictEqual(test1.verified, true);
assert.strictEqual(test1.section, 'Section 5. Confidentiality Obligations');
assert.strictEqual(test1.page, 2);
console.log('  ✓ Exact match quote verified');

const test2 = QuoteVerifier.verifyQuote(
  'hold the other Party\'s Confidential   Information\nin strict confidence',
  sourceText,
  dummyChunks
);
assert.strictEqual(test2.verified, true);
console.log('  ✓ Whitespace/newline normalized quote verified');

const test3 = QuoteVerifier.verifyQuote(
  'Breach of confidentiality results in a liquidated damages penalty of $1,000,000',
  sourceText,
  dummyChunks
);
assert.strictEqual(test3.verified, false);
console.log('  ✓ Fabricated quote rejected with verified=false');

const test4 = QuoteVerifier.verifyQuote(
  'Not found in the contract',
  sourceText,
  dummyChunks
);
assert.strictEqual(test4.verified, false);
console.log('  ✓ Not found phrase rejected with verified=false');

console.log('All QuoteVerifier tests passed!\n');
