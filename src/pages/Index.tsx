import { KanbanBoard } from '@/components/KanbanBoard';

const Index = () => {
  return (
    <div className="min-h-screen aegean-canvas">
      {/* Header */}
      <header className="relative z-10 border-b border-border/40 bg-card/60 backdrop-blur-sm sticky top-0 z-40">
        <div className="max-w-[1280px] mx-auto px-6 py-5">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-medium text-foreground tracking-tight">
                Focus Board
              </h1>
              <p className="text-sm text-muted-foreground mt-1 leading-relaxed">
                One task at a time. You've got this.
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 max-w-[1280px] mx-auto">
        <KanbanBoard />
      </main>
    </div>
  );
};

export default Index;