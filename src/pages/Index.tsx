import { useState } from 'react';
import { FileText, Layers, Code2, RefreshCcw, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileDropzone } from '@/components/FileDropzone';
import { ProcessingStatus } from '@/components/ProcessingStatus';
import { HierarchyTree } from '@/components/HierarchyTree';
import { JsonViewer } from '@/components/JsonViewer';
import { StatisticsCard } from '@/components/StatisticsCard';
import { useHierarchyExtraction } from '@/hooks/useHierarchyExtraction';
import { cn } from '@/lib/utils';

const Index = () => {
  const { status, result, fileName, processFile, reset } = useHierarchyExtraction();
  const [activeTab, setActiveTab] = useState('tree');

  const isProcessing = ['uploading', 'extracting', 'analyzing'].includes(status.stage);
  const showResults = result !== null;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-lg">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20">
              <Layers className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground">DocHierarchy</h1>
              <p className="text-xs text-muted-foreground hidden sm:block">AI-Powered Document Structure Extraction</p>
            </div>
          </div>

          {showResults && (
            <Button variant="outline" size="sm" onClick={reset}>
              <RefreshCcw className="w-4 h-4" />
              <span className="hidden sm:inline">New Document</span>
            </Button>
          )}
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Hero Section - shown when idle */}
        {status.stage === 'idle' && !showResults && (
          <div className="max-w-3xl mx-auto text-center mb-12 animate-fade-in">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6">
              <Sparkles className="w-4 h-4 text-primary" />
              <span className="text-sm text-primary font-medium">Powered by AI</span>
            </div>
            
            <h2 className="text-4xl sm:text-5xl font-bold mb-4">
              <span className="gradient-text">Extract Document</span>
              <br />
              <span className="text-foreground">Hierarchy Instantly</span>
            </h2>
            
            <p className="text-lg text-muted-foreground max-w-xl mx-auto">
              Transform complex PDF documents into structured JSON with AI-powered 
              heading detection, section mapping, and hierarchy analysis.
            </p>
          </div>
        )}

        {/* Upload Section */}
        {!showResults && (
          <div className="max-w-2xl mx-auto mb-8 animate-fade-in" style={{ animationDelay: '100ms' }}>
            <FileDropzone onFileSelect={processFile} isProcessing={isProcessing} />
          </div>
        )}

        {/* Processing Status */}
        {status.stage !== 'idle' && (
          <div className="max-w-2xl mx-auto mb-8">
            <ProcessingStatus status={status} />
          </div>
        )}

        {/* Results Section */}
        {showResults && (
          <div className="animate-fade-in">
            {/* Document Title */}
            <div className="max-w-5xl mx-auto mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-success/10">
                  <FileText className="w-5 h-5 text-success" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{result.title}</h3>
                  <p className="text-sm text-muted-foreground">{fileName}</p>
                </div>
              </div>
            </div>

            {/* Main Content Grid */}
            <div className="max-w-5xl mx-auto grid lg:grid-cols-3 gap-6">
              {/* Statistics - Sidebar on large screens */}
              <div className="lg:col-span-1 space-y-6">
                <StatisticsCard result={result} />
                
                {/* Quick actions */}
                <div className="rounded-xl bg-card border border-border p-4">
                  <h4 className="text-sm font-medium text-foreground mb-3">Quick Actions</h4>
                  <div className="space-y-2">
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('json')}
                    >
                      <Code2 className="w-4 h-4" />
                      View JSON Output
                    </Button>
                    <Button 
                      variant="secondary" 
                      size="sm" 
                      className="w-full justify-start"
                      onClick={() => setActiveTab('tree')}
                    >
                      <Layers className="w-4 h-4" />
                      View Hierarchy Tree
                    </Button>
                  </div>
                </div>
              </div>

              {/* Main Content - Tabs */}
              <div className="lg:col-span-2">
                <Tabs value={activeTab} onValueChange={setActiveTab}>
                  <TabsList className="w-full bg-card border border-border mb-4">
                    <TabsTrigger value="tree" className="flex-1 data-[state=active]:bg-primary/10">
                      <Layers className="w-4 h-4 mr-2" />
                      Hierarchy Tree
                    </TabsTrigger>
                    <TabsTrigger value="json" className="flex-1 data-[state=active]:bg-primary/10">
                      <Code2 className="w-4 h-4 mr-2" />
                      JSON Output
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="tree" className="mt-0">
                    <div className="rounded-xl bg-card border border-border p-4 max-h-[600px] overflow-auto">
                      <HierarchyTree nodes={result.hierarchy} />
                    </div>
                  </TabsContent>

                  <TabsContent value="json" className="mt-0">
                    <JsonViewer data={result} title="document-hierarchy.json" />
                  </TabsContent>
                </Tabs>
              </div>
            </div>
          </div>
        )}

        {/* Features Section - shown when idle */}
        {status.stage === 'idle' && !showResults && (
          <div className="max-w-4xl mx-auto mt-16 animate-fade-in" style={{ animationDelay: '200ms' }}>
            <div className="grid sm:grid-cols-3 gap-6">
              {[
                {
                  icon: FileText,
                  title: 'Smart Extraction',
                  description: 'Automatically detects headings, sections, and content blocks'
                },
                {
                  icon: Layers,
                  title: 'Hierarchy Mapping',
                  description: 'Builds nested tree structure preserving document organization'
                },
                {
                  icon: Code2,
                  title: 'JSON Export',
                  description: 'Clean, structured JSON output ready for downstream processing'
                },
              ].map((feature, index) => (
                <div
                  key={feature.title}
                  className={cn(
                    "group p-6 rounded-xl bg-card/50 border border-border",
                    "hover:bg-card hover:border-primary/30 transition-all duration-300",
                    "animate-slide-in"
                  )}
                  style={{ animationDelay: `${300 + index * 100}ms` }}
                >
                  <div className="p-3 rounded-lg bg-primary/10 w-fit mb-4 group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-auto py-6">
        <div className="container mx-auto px-4 text-center">
          <p className="text-sm text-muted-foreground">
            DocHierarchy — Transform unstructured documents into structured data
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Index;
