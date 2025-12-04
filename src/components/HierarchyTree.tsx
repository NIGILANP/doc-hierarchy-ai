import { useState } from 'react';
import { ChevronRight, ChevronDown, FileText, Heading1, Heading2, List, Table, Layers } from 'lucide-react';
import { HierarchyNode } from '@/types/hierarchy';
import { cn } from '@/lib/utils';

interface HierarchyTreeProps {
  nodes: HierarchyNode[];
  level?: number;
}

const typeIcons = {
  heading: Heading1,
  subheading: Heading2,
  paragraph: FileText,
  list: List,
  table: Table,
  section: Layers,
};

const typeColors = {
  heading: 'text-primary',
  subheading: 'text-accent',
  paragraph: 'text-muted-foreground',
  list: 'text-warning',
  table: 'text-info',
  section: 'text-success',
};

function TreeNode({ node, level = 0 }: { node: HierarchyNode; level?: number }) {
  const [isExpanded, setIsExpanded] = useState(level < 2);
  const hasChildren = node.children && node.children.length > 0;
  const Icon = typeIcons[node.type] || FileText;

  return (
    <div 
      className="animate-fade-in"
      style={{ animationDelay: `${level * 50}ms` }}
    >
      <div
        className={cn(
          "group flex items-start gap-2 py-2 px-3 rounded-lg transition-all duration-200",
          "hover:bg-secondary/50 cursor-pointer",
          level === 0 && "bg-card/50"
        )}
        onClick={() => hasChildren && setIsExpanded(!isExpanded)}
      >
        {/* Expand/collapse button */}
        <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center">
          {hasChildren ? (
            <button className="p-0.5 rounded hover:bg-primary/20 transition-colors">
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-primary" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-primary" />
              )}
            </button>
          ) : (
            <div className="w-1.5 h-1.5 rounded-full bg-border" />
          )}
        </div>

        {/* Type icon */}
        <div className={cn(
          "flex-shrink-0 p-1.5 rounded-md",
          "bg-secondary/50 group-hover:bg-secondary"
        )}>
          <Icon className={cn("w-4 h-4", typeColors[node.type])} />
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <p className={cn(
            "text-sm truncate",
            node.type === 'heading' && "font-semibold text-foreground",
            node.type === 'subheading' && "font-medium text-foreground",
            node.type === 'paragraph' && "text-muted-foreground"
          )}>
            {node.text}
          </p>
          
          {/* Metadata badges */}
          <div className="flex items-center gap-2 mt-1">
            <span className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              "bg-secondary text-muted-foreground"
            )}>
              {node.type}
            </span>
            {node.metadata?.confidence && (
              <span className={cn(
                "text-xs px-2 py-0.5 rounded-full",
                node.metadata.confidence > 0.8 ? "bg-success/20 text-success" :
                node.metadata.confidence > 0.5 ? "bg-warning/20 text-warning" :
                "bg-destructive/20 text-destructive"
              )}>
                {Math.round(node.metadata.confidence * 100)}% conf
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Children */}
      {hasChildren && isExpanded && (
        <div className={cn(
          "ml-6 pl-4 border-l-2 border-dashed border-border/50",
          "animate-fade-in"
        )}>
          {node.children.map((child, index) => (
            <TreeNode key={child.id || index} node={child} level={level + 1} />
          ))}
        </div>
      )}
    </div>
  );
}

export function HierarchyTree({ nodes }: HierarchyTreeProps) {
  if (!nodes || nodes.length === 0) {
    return (
      <div className="text-center py-12 text-muted-foreground">
        <Layers className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No hierarchy data to display</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {nodes.map((node, index) => (
        <TreeNode key={node.id || index} node={node} level={0} />
      ))}
    </div>
  );
}
