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

const columnColors: Record<ColumnId, string> = {
  todo: 'bg-accent/50',
  inProgress: 'bg-primary/5',
  done: 'bg-muted/30',
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
        'flex flex-col rounded-2xl p-4 min-h-[500px] lg:min-h-[600px]',
        'transition-colors duration-200',
        columnColors[id],
        isOver && 'ring-2 ring-primary/30 bg-primary/10'
      )}
    >
      {/* Column Header */}
      <div className="flex items-center justify-between mb-4 px-1">
        <h2 className="text-lg font-semibold text-foreground">{title}</h2>
        <span className="text-sm font-medium text-muted-foreground bg-background/80 px-2.5 py-1 rounded-full">
          {tasks.length}
        </span>
      </div>

      {/* Tasks Container */}
      <div
        ref={setNodeRef}
        className="flex-1 space-y-4 overflow-y-auto"
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
          <div className="flex items-center justify-center h-32 border-2 border-dashed border-border/50 rounded-xl">
            <p className="text-sm text-muted-foreground">Drop tasks here</p>
          </div>
        )}
      </div>
    </div>
  );
}
