import * as pdfjsLib from 'pdfjs-dist';

// Set worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs`;

export interface PDFExtractionResult {
  textContent: string;
  pageBreaks: number[];
  pageCount: number;
  metadata?: {
    title?: string;
    author?: string;
    subject?: string;
  };
}

export async function extractTextFromPDF(file: File): Promise<PDFExtractionResult> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let fullText = '';
  const pageBreaks: number[] = [];
  
  // Extract metadata
  const metadata = await pdf.getMetadata();
  const info = metadata.info as Record<string, unknown>;
  
  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    
    // Track page break positions
    pageBreaks.push(fullText.length);
    
    // Extract text items with their positions
    const textItems = content.items.map((item: any) => {
      if ('str' in item) {
        return item.str;
      }
      return '';
    });
    
    const pageText = textItems.join(' ');
    fullText += pageText + '\n\n';
  }

  return {
    textContent: fullText.trim(),
    pageBreaks,
    pageCount: pdf.numPages,
    metadata: {
      title: info?.Title as string | undefined,
      author: info?.Author as string | undefined,
      subject: info?.Subject as string | undefined,
    },
  };
}
