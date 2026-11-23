export class Chunker {

  static chunkDocument(docData, contractId, ownerId) {
    const chunks = [];
    const { pages, text } = docData;

    const sectionRegex = /(?:^|\n)(?:(?:ARTICLE|SECTION|CLAUSE)\s+[0-9IVXLCDM]+[.:\s]|(?:[0-9]+\.[0-9]*\s+[A-Z][A-Za-z\s]+))/m;

    let chunkIndex = 0;
    const maxChunkSize = 800;
    const overlapSize = 100;

    for (const page of pages) {
      const pageNum = page.pageNumber;
      const paragraphs = page.text.split(/\n\s*\n+/);

      let currentSection = `Page ${pageNum}`;
      let currentChunkText = '';

      for (const para of paragraphs) {
        const trimmed = para.trim();
        if (!trimmed) continue;

        if (sectionRegex.test(trimmed)) {
          const lines = trimmed.split('\n');
          currentSection = lines[0].substring(0, 80).trim();
        }

        if (currentChunkText.length + trimmed.length <= maxChunkSize) {
          currentChunkText += (currentChunkText ? '\n\n' : '') + trimmed;
        } else {
          if (currentChunkText.length > 0) {
            chunks.push({
              ownerId,
              contractId,
              chunkIndex: chunkIndex++,
              text: currentChunkText,
              pageStart: pageNum,
              pageEnd: pageNum,
              section: currentSection,
            });

            const overlap = currentChunkText.slice(-overlapSize);
            currentChunkText = overlap + '\n\n' + trimmed;
          } else {

            chunks.push({
              ownerId,
              contractId,
              chunkIndex: chunkIndex++,
              text: trimmed.slice(0, maxChunkSize),
              pageStart: pageNum,
              pageEnd: pageNum,
              section: currentSection,
            });
            currentChunkText = trimmed.slice(maxChunkSize - overlapSize);
          }
        }
      }

      if (currentChunkText.trim().length > 0) {
        chunks.push({
          ownerId,
          contractId,
          chunkIndex: chunkIndex++,
          text: currentChunkText.trim(),
          pageStart: pageNum,
          pageEnd: pageNum,
          section: currentSection,
        });
      }
    }

    if (chunks.length === 0 && text && text.trim()) {
      chunks.push({
        ownerId,
        contractId,
        chunkIndex: 0,
        text: text.trim().slice(0, 2000),
        pageStart: 1,
        pageEnd: 1,
        section: 'General',
      });
    }

    return chunks;
  }
}
