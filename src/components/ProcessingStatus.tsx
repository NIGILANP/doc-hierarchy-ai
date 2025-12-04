import { Loader2, CheckCircle2, AlertCircle, FileSearch, Brain, Sparkles } from 'lucide-react';
import { ProcessingStatus as ProcessingStatusType } from '@/types/hierarchy';
import { cn } from '@/lib/utils';

interface ProcessingStatusProps {
  status: ProcessingStatusType;
}

const stageIcons = {
  idle: null,
  uploading: Loader2,
  extracting: FileSearch,
  analyzing: Brain,
  complete: CheckCircle2,
  error: AlertCircle,
};

const stageColors = {
  idle: 'text-muted-foreground',
  uploading: 'text-info',
  extracting: 'text-warning',
  analyzing: 'text-primary',
  complete: 'text-success',
  error: 'text-destructive',
};

export function ProcessingStatus({ status }: ProcessingStatusProps) {
  const Icon = stageIcons[status.stage];
  const isAnimating = ['uploading', 'extracting', 'analyzing'].includes(status.stage);

  if (status.stage === 'idle') return null;

  return (
    <div className="relative overflow-hidden rounded-xl bg-card border border-border p-6">
      {/* Animated background for processing states */}
      {isAnimating && (
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 via-accent/5 to-primary/5 animate-shimmer" 
             style={{ backgroundSize: '200% 100%' }} />
      )}

      <div className="relative flex items-center gap-4">
        {/* Icon container */}
        <div className={cn(
          "flex-shrink-0 p-3 rounded-xl",
          status.stage === 'complete' && "bg-success/10",
          status.stage === 'error' && "bg-destructive/10",
          isAnimating && "bg-primary/10"
        )}>
          {Icon && (
            <Icon className={cn(
              "w-6 h-6",
              stageColors[status.stage],
              isAnimating && "animate-spin"
            )} />
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={cn("font-medium", stageColors[status.stage])}>
            {status.message}
          </p>
          
          {/* Progress bar */}
          {isAnimating && (
            <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
              <div 
                className="h-full bg-gradient-to-r from-primary to-accent rounded-full transition-all duration-500"
                style={{ width: `${status.progress}%` }}
              />
            </div>
          )}
        </div>

        {/* Sparkle effect for complete state */}
        {status.stage === 'complete' && (
          <Sparkles className="w-5 h-5 text-accent animate-pulse" />
        )}
      </div>

      {/* Scan line animation for analyzing state */}
      {status.stage === 'analyzing' && (
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute inset-x-0 h-px bg-gradient-to-r from-transparent via-primary to-transparent animate-scan" />
        </div>
      )}
    </div>
  );
}
