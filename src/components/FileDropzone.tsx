import { useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  isProcessing: boolean;
}

export function FileDropzone({ onFileSelect, isProcessing }: FileDropzoneProps) {
  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      onFileSelect(acceptedFiles[0]);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive, isDragReject } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
    },
    maxFiles: 1,
    disabled: isProcessing,
  });

  return (
    <div
      {...getRootProps()}
      className={cn(
        "relative group cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-300",
        "min-h-[280px] flex flex-col items-center justify-center p-8",
        isDragActive && !isDragReject && "border-primary bg-primary/5 scale-[1.02]",
        isDragReject && "border-destructive bg-destructive/5",
        !isDragActive && !isDragReject && "border-border hover:border-primary/50 hover:bg-card/50",
        isProcessing && "opacity-50 cursor-not-allowed"
      )}
    >
      <input {...getInputProps()} />
      
      {/* Animated background gradient */}
      <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5 rounded-2xl" />
      </div>

      {/* Icon */}
      <div className={cn(
        "relative mb-6 p-6 rounded-2xl transition-all duration-300",
        "bg-gradient-to-br from-primary/10 to-accent/10",
        isDragActive && "scale-110 from-primary/20 to-accent/20"
      )}>
        {isDragReject ? (
          <AlertCircle className="w-12 h-12 text-destructive" />
        ) : isDragActive ? (
          <FileText className="w-12 h-12 text-primary animate-pulse" />
        ) : (
          <Upload className="w-12 h-12 text-primary" />
        )}
      </div>

      {/* Text content */}
      <div className="relative text-center space-y-2">
        {isDragReject ? (
          <>
            <p className="text-lg font-semibold text-destructive">Invalid file type</p>
            <p className="text-sm text-muted-foreground">Only PDF files are supported</p>
          </>
        ) : isDragActive ? (
          <>
            <p className="text-lg font-semibold text-primary">Drop your PDF here</p>
            <p className="text-sm text-muted-foreground">Release to start processing</p>
          </>
        ) : (
          <>
            <p className="text-lg font-semibold text-foreground">
              Drag & drop your PDF document
            </p>
            <p className="text-sm text-muted-foreground">
              or click to browse files
            </p>
            <p className="text-xs text-muted-foreground/70 mt-4">
              Supports PDF files up to 50MB
            </p>
          </>
        )}
      </div>

      {/* Decorative corners */}
      <div className="absolute top-4 left-4 w-8 h-8 border-l-2 border-t-2 border-primary/30 rounded-tl-lg" />
      <div className="absolute top-4 right-4 w-8 h-8 border-r-2 border-t-2 border-primary/30 rounded-tr-lg" />
      <div className="absolute bottom-4 left-4 w-8 h-8 border-l-2 border-b-2 border-primary/30 rounded-bl-lg" />
      <div className="absolute bottom-4 right-4 w-8 h-8 border-r-2 border-b-2 border-primary/30 rounded-br-lg" />
    </div>
  );
}
