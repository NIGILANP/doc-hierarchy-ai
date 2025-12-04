export interface HierarchyNode {
  id: string;
  level: number;
  type: 'heading' | 'subheading' | 'paragraph' | 'list' | 'table' | 'section';
  text: string;
  children: HierarchyNode[];
  metadata?: {
    pageNumber?: number;
    confidence?: number;
    style?: string;
  };
}

export interface ExtractionResult {
  title: string;
  hierarchy: HierarchyNode[];
  statistics: {
    totalNodes: number;
    headings: number;
    paragraphs: number;
    maxDepth: number;
  };
  parseWarning?: string;
}

export interface ProcessingStatus {
  stage: 'idle' | 'uploading' | 'extracting' | 'analyzing' | 'complete' | 'error';
  progress: number;
  message: string;
}
