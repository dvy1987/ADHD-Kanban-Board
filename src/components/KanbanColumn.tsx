import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Task, ColumnId } from '@/types/task';
import { TaskCard } from './TaskCard';
import { cn } from '@/lib/utils';

interface KanbanColumnProps {
  id: ColumnId;
  title: string;
  tasks: Task[];
  onToggleStep: (taskId: string, stepId: string) => void;
  onAddStep: (taskId: string, text: string) => void;
  onStartFocus: (taskId: string) => void;
  onUpdateImpact: (taskId: string, stars: 1 | 2 | 3) => void;
}

// Limewash column backgrounds - subtle cerulean undertones
const columnStyles: Record<ColumnId, string> = {
  todo: 'bg-[hsl(200_28%_96%)]',
  inProgress: 'bg-[hsl(198_32%_94%)]',
  done: 'bg-[hsl(195_35%_92%)]',
};

export function KanbanColumn({
  id,
  title,
  tasks,
  onToggleStep,
  onAddStep,
  onStartFocus,
  onUpdateImpact,
}: KanbanColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id });

  return (
    <div
      className={cn(
        'flex flex-col rounded-2xl p-5 min-h-[500px] lg:min-h-[600px]',
        'limewash-column',
        'transition-all duration-200',
        columnStyles[id],
        isOver && 'ring-2 ring-primary/25 bg-primary/5'
      )}
      style={{
        boxShadow: 'inset 0 2px 8px hsl(209 21% 21% / 0.03)',
      }}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-5 px-1">
        <h2 className="text-base font-medium text-foreground tracking-tight">{title}</h2>
        <span className="text-sm font-medium text-muted-foreground bg-background/70 px-2.5 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Thin cerulean-slate separator */}
      <div className="h-px bg-[hsl(200_55%_55%/0.08)] mb-5 mx-1" />

      {/* Tasks Container */}
      <div
        ref={setNodeRef}
        className="flex-1 space-y-5 overflow-y-auto"
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onToggleStep={(stepId) => onToggleStep(task.id, stepId)}
              onAddStep={(text) => onAddStep(task.id, text)}
              onStartFocus={() => onStartFocus(task.id)}
              onUpdateImpact={(stars) => onUpdateImpact(task.id, stars)}
            />
          ))}
        </SortableContext>

        {tasks.length === 0 && (
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-primary/15 rounded-xl bg-background/30">
            <p className="text-sm text-muted-foreground">Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
}