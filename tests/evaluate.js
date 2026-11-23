import fs from 'fs/promises';
import path from 'path';
import { CHECKLIST_ITEMS } from '../server/src/services/review/checklistDefinitions.js';
import { ReviewEngine } from '../server/src/services/review/reviewEngine.js';
import { Chunker } from '../server/src/services/document/chunker.js';

const GROUND_TRUTH = {
  'contract_nda.txt': {
    name: 'Mutual Non-Disclosure Agreement (NDA)',
    expected: {
      parties: 'found',
      start_date_and_term: 'found',
      payment_terms: 'not_found',
      termination: 'found',
      limitation_of_liability: 'found',
      confidentiality: 'found',
      governing_law: 'found',
      auto_renewal: 'not_found',
    },
  },
  'contract_saas_msa.txt': {
    name: 'Master Services Agreement (SaaS MSA)',
    expected: {
      parties: 'found',
      start_date_and_term: 'found',
      payment_terms: 'found',
      termination: 'found',
      limitation_of_liability: 'found',
      confidentiality: 'found',
      governing_law: 'found',
      auto_renewal: 'found',
    },
  },
};

async function runEvaluation() {
  console.log('\n===========================================================================');
  console.log('        CONTRACT REVIEW ASSISTANT - ACCURACY EVALUATION BENCHMARK          ');
  console.log('         Testing Grounded Checklist Pipeline Against Ground Truth          ');
  console.log('===========================================================================\n');

  let totalItems = 0;
  let correctStatusCount = 0;
  let totalQuotesExpected = 0;
  let verifiedQuotesCount = 0;

  for (const [filename, info] of Object.entries(GROUND_TRUTH)) {
    const filePath = path.join('sample_contracts', filename);
    const text = await fs.readFile(filePath, 'utf-8');

    const docData = {
      text,
      pages: [{ pageNumber: 1, text }],
      totalPages: 1,
    };

    const chunks = Chunker.chunkDocument(docData, 'bench_contract_id', 'bench_owner_id');
    const findings = await ReviewEngine.analyzeContract('bench_contract_id', 'bench_owner_id', chunks, text);

    console.log(`===========================================================================`);
    console.log(`EVALUATING: ${info.name} (${filename})`);
    console.log(`===========================================================================`);
    console.log(
      `${'Checklist Item'.padEnd(25)} | ${'Expected'.padEnd(10)} | ${'Actual'.padEnd(10)} | ${'Result'.padEnd(6)} | ${'Quote Verified'}`
    );
    console.log('-'.repeat(75));

    const findingsMap = new Map(findings.map((f) => [f.itemKey, f]));

    for (const item of CHECKLIST_ITEMS) {
      totalItems++;
      const expectedStatus = info.expected[item.key];
      const actualFinding = findingsMap.get(item.key) || { status: 'unclear' };
      const actualStatus = actualFinding.status;
      const isCorrect = expectedStatus === actualStatus;

      if (isCorrect) correctStatusCount++;

      let quoteStatus = 'N/A';
      if (expectedStatus === 'found') {
        totalQuotesExpected++;
        if (actualFinding.quoteVerified) {
          verifiedQuotesCount++;
          quoteStatus = 'Verified (100%)';
        } else {
          quoteStatus = 'Failed (Unverified)';
        }
      }

      console.log(
        `${item.name.padEnd(25)} | ${expectedStatus.padEnd(10)} | ${actualStatus.padEnd(10)} | ${(isCorrect ? 'PASS' : 'FAIL').padEnd(6)} | ${quoteStatus}`
      );
    }

    console.log('-'.repeat(75));
    console.log('');
  }

  const accuracyPct = ((correctStatusCount / totalItems) * 100).toFixed(1);
  const quotePct = ((verifiedQuotesCount / totalQuotesExpected) * 100).toFixed(1);

  console.log('===========================================================================');
  console.log(`OVERALL BENCHMARK ACCURACY : ${correctStatusCount}/${totalItems} items correct (${accuracyPct}%)`);
  console.log(`OVERALL QUOTE VERIFICATION : ${verifiedQuotesCount}/${totalQuotesExpected} quotes verified (${quotePct}%)`);
  console.log('===========================================================================\n');
}

runEvaluation().catch(console.error);
