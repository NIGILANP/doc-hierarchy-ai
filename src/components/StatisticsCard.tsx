import { Layers, Heading1, FileText, GitBranch } from 'lucide-react';
import { ExtractionResult } from '@/types/hierarchy';
import { cn } from '@/lib/utils';

interface StatisticsCardProps {
  result: ExtractionResult;
}

export function StatisticsCard({ result }: StatisticsCardProps) {
  const stats = [
    {
      label: 'Total Nodes',
      value: result.statistics.totalNodes,
      icon: Layers,
      color: 'text-primary',
      bgColor: 'bg-primary/10',
    },
    {
      label: 'Headings',
      value: result.statistics.headings,
      icon: Heading1,
      color: 'text-accent',
      bgColor: 'bg-accent/10',
    },
    {
      label: 'Paragraphs',
      value: result.statistics.paragraphs,
      icon: FileText,
      color: 'text-warning',
      bgColor: 'bg-warning/10',
    },
    {
      label: 'Max Depth',
      value: result.statistics.maxDepth,
      icon: GitBranch,
      color: 'text-info',
      bgColor: 'bg-info/10',
    },
  ];

  return (
    <div className="rounded-xl bg-card border border-border p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Document Statistics
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div
            key={stat.label}
            className={cn(
              "flex items-center gap-3 p-4 rounded-lg bg-secondary/30",
              "animate-scale-in"
            )}
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className={cn("p-2.5 rounded-lg", stat.bgColor)}>
              <stat.icon className={cn("w-5 h-5", stat.color)} />
            </div>
            <div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground">{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      {result.parseWarning && (
        <div className="mt-4 p-3 rounded-lg bg-warning/10 border border-warning/20">
          <p className="text-sm text-warning">{result.parseWarning}</p>
        </div>
      )}
    </div>
  );
}
