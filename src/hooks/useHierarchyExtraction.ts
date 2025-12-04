import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { extractTextFromPDF } from '@/lib/pdfExtractor';
import { ExtractionResult, ProcessingStatus } from '@/types/hierarchy';
import { toast } from '@/hooks/use-toast';

export function useHierarchyExtraction() {
  const [status, setStatus] = useState<ProcessingStatus>({
    stage: 'idle',
    progress: 0,
    message: '',
  });
  const [result, setResult] = useState<ExtractionResult | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const processFile = useCallback(async (file: File) => {
    setResult(null);
    setFileName(file.name);

    try {
      // Stage 1: Uploading/Reading
      setStatus({
        stage: 'uploading',
        progress: 10,
        message: 'Reading PDF file...',
      });

      await new Promise(resolve => setTimeout(resolve, 500));

      // Stage 2: Extracting text
      setStatus({
        stage: 'extracting',
        progress: 30,
        message: 'Extracting text content...',
      });

      const pdfResult = await extractTextFromPDF(file);
      
      if (!pdfResult.textContent || pdfResult.textContent.length < 50) {
        throw new Error('Could not extract sufficient text from PDF. The document may be image-based or protected.');
      }

      setStatus({
        stage: 'extracting',
        progress: 50,
        message: `Extracted ${pdfResult.pageCount} pages...`,
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      // Stage 3: AI Analysis
      setStatus({
        stage: 'analyzing',
        progress: 60,
        message: 'AI analyzing document structure...',
      });

      const { data, error } = await supabase.functions.invoke('extract-hierarchy', {
        body: {
          textContent: pdfResult.textContent,
          pageBreaks: pdfResult.pageBreaks,
        },
      });

      if (error) {
        console.error('Edge function error:', error);
        throw new Error(error.message || 'Failed to analyze document');
      }

      if (data?.error) {
        throw new Error(data.error);
      }

      setStatus({
        stage: 'analyzing',
        progress: 90,
        message: 'Building hierarchy tree...',
      });

      await new Promise(resolve => setTimeout(resolve, 300));

      // Merge PDF metadata with AI result
      const finalResult: ExtractionResult = {
        title: data.title || pdfResult.metadata?.title || file.name.replace('.pdf', ''),
        hierarchy: data.hierarchy || [],
        statistics: data.statistics || {
          totalNodes: 0,
          headings: 0,
          paragraphs: 0,
          maxDepth: 0,
        },
        parseWarning: data.parseWarning,
      };

      setResult(finalResult);
      setStatus({
        stage: 'complete',
        progress: 100,
        message: 'Analysis complete!',
      });

      toast({
        title: 'Success',
        description: `Extracted ${finalResult.statistics.totalNodes} elements from document`,
      });

    } catch (error) {
      console.error('Processing error:', error);
      setStatus({
        stage: 'error',
        progress: 0,
        message: error instanceof Error ? error.message : 'An unexpected error occurred',
      });

      toast({
        title: 'Error',
        description: error instanceof Error ? error.message : 'Failed to process document',
        variant: 'destructive',
      });
    }
  }, []);

  const reset = useCallback(() => {
    setStatus({ stage: 'idle', progress: 0, message: '' });
    setResult(null);
    setFileName(null);
  }, []);

  return {
    status,
    result,
    fileName,
    processFile,
    reset,
  };
}
