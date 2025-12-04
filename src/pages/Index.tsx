import { KanbanBoard } from '@/components/KanbanBoard';

const Index = () => {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold text-foreground">
                Focus Board
              </h1>
              <p className="text-sm text-muted-foreground mt-0.5">
                One task at a time. You've got this.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto">
        <KanbanBoard />
      </main>
    </div>
  );
};

export default Index;
