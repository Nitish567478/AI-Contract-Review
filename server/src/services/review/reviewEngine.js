import { CHECKLIST_ITEMS } from './checklistDefinitions.js';
import { QuoteVerifier } from './quoteVerifier.js';
import { GeminiService } from '../gemini/geminiClient.js';
import { logger } from '../../utils/logger.js';

export class ReviewEngine {

  static async analyzeContract(contractId, ownerId, chunks, fullText) {
    logger.info(`Starting 8-item checklist analysis for contract ${contractId}`);

    const rawFindings = await GeminiService.reviewChecklist(CHECKLIST_ITEMS, chunks, fullText);
    const findingsMap = new Map();
    for (const rf of rawFindings) {
      if (rf.itemKey) {
        findingsMap.set(rf.itemKey, rf);
      }
    }

    const verifiedFindings = [];

    for (const item of CHECKLIST_ITEMS) {
      const raw = findingsMap.get(item.key) || {
        itemKey: item.key,
        status: 'not_found',
        summary: 'Not found in the contract.',
        quote: null,
      };

      let finalStatus = raw.status || 'not_found';
      let finalSummary = raw.summary || '';
      let finalQuote = raw.quote || null;
      let finalLocation = {
        page: raw.page ?? null,
        section: raw.section ?? null,
        chunkId: null,
      };
      let fullClause = null;
      let quoteVerified = false;
      let needsAttention = false;

      if (finalStatus === 'found') {
        let verification = QuoteVerifier.verifyQuote(finalQuote, fullText, chunks);

        if (!verification.verified) {

          const recovered = GeminiService.extractHeuristicFindings([item], chunks, fullText);
          if (recovered && recovered[0] && recovered[0].quote) {
            const recVerif = QuoteVerifier.verifyQuote(recovered[0].quote, fullText, chunks);
            if (recVerif.verified) {
              finalQuote = recovered[0].quote;
              verification = recVerif;
            }
          }
        }

        if (verification.verified) {
          quoteVerified = true;
          finalLocation.page = verification.page ?? finalLocation.page;
          finalLocation.section = verification.section ?? finalLocation.section;
          finalLocation.chunkId = verification.chunkId ?? null;
          fullClause = verification.fullClause || null;

          const lowerQuote = (finalQuote || '').toLowerCase();
          if (item.key === 'limitation_of_liability' && (lowerQuote.includes('unlimited') || lowerQuote.includes('sole discretion'))) {
            needsAttention = true;
          } else if (item.key === 'auto_renewal' && (lowerQuote.includes('60 days') || lowerQuote.includes('90 days'))) {
            needsAttention = true;
          } else if (item.key === 'termination' && lowerQuote.includes('immediate')) {
            needsAttention = true;
          }
        } else {

          logger.warn(`Verification failed for item [${item.key}]: ${verification.reason}`);
          finalStatus = 'unclear';
          quoteVerified = false;
          finalQuote = null;
          finalLocation = { page: null, section: null, chunkId: null };
          finalSummary = 'Unclear: relevant provisions could not be verified verbatim in the extracted contract text.';
          fullClause = null;
          needsAttention = true;
        }
      } else if (finalStatus === 'not_found') {
        finalSummary = 'Not found in the contract.';
        finalQuote = null;
        finalLocation = { page: null, section: null, chunkId: null };
        fullClause = null;
        quoteVerified = false;
      } else {

        finalStatus = 'unclear';
        finalQuote = null;
        finalLocation = { page: null, section: null, chunkId: null };
        fullClause = null;
        quoteVerified = false;
      }

      verifiedFindings.push({
        itemKey: item.key,
        status: finalStatus,
        summary: finalSummary,
        quote: finalQuote,
        location: finalLocation,
        fullClause,
        quoteVerified,
        needsAttention,
      });
    }

    return verifiedFindings;
  }
}
