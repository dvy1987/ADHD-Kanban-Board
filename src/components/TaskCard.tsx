import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Play, Check, Plus } from 'lucide-react';
import { useState } from 'react';
import { Task, Step } from '@/types/task';
import { ImpactStars } from './ImpactStars';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';

interface TaskCardProps {
  task: Task;
  onToggleStep: (stepId: string) => void;
  onAddStep: (text: string) => void;
  onStartFocus: () => void;
  onUpdateImpact: (stars: 1 | 2 | 3) => void;
}

export function TaskCard({
  task,
  onToggleStep,
  onAddStep,
  onStartFocus,
  onUpdateImpact,
}: TaskCardProps) {
  const [newStep, setNewStep] = useState('');
  const [isAddingStep, setIsAddingStep] = useState(false);

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const handleAddStep = () => {
    if (newStep.trim()) {
      onAddStep(newStep.trim());
      setNewStep('');
      setIsAddingStep(false);
    }
  };

  const hasHighImpact = task.impactStars === 3;

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={cn(
        'bg-card rounded-xl p-4 shadow-md border border-border/50',
        'cursor-grab active:cursor-grabbing',
        'transition-all duration-200',
        'hover:shadow-lg hover:border-primary/20',
        isDragging && 'opacity-50 scale-105 shadow-xl',
        hasHighImpact && 'animate-gentle-glow'
      )}
    >
      {/* Top Row: Title and Stars */}
      <div className="flex items-start justify-between gap-3 mb-3">
        <h3 className="text-base font-semibold text-card-foreground truncate flex-1">
          {task.title}
        </h3>
        <ImpactStars count={task.impactStars} onChange={onUpdateImpact} />
      </div>

      {/* Middle: Steps */}
      <div className="space-y-2 mb-4">
        {/* Next Steps */}
        {task.nextSteps.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Next Steps
            </p>
            {task.nextSteps.map((step) => (
              <StepItem
                key={step.id}
                step={step}
                onToggle={() => onToggleStep(step.id)}
              />
            ))}
          </div>
        )}

        {/* Add Step */}
        {task.column !== 'done' && (
          <div className="pt-1">
            {isAddingStep ? (
              <div className="flex gap-2">
                <Input
                  value={newStep}
                  onChange={(e) => setNewStep(e.target.value)}
                  placeholder="Add a step..."
                  className="h-8 text-sm"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddStep();
                    if (e.key === 'Escape') setIsAddingStep(false);
                  }}
                  autoFocus
                />
                <button
                  onClick={handleAddStep}
                  className="p-1.5 rounded-md bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingStep(true)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors"
              >
                <Plus className="w-4 h-4" />
                Add step
              </button>
            )}
          </div>
        )}

        {/* Completed Steps */}
        {task.completedSteps.length > 0 && (
          <div className="space-y-1.5 pt-2 border-t border-border/50">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
              Completed
            </p>
            {task.completedSteps.map((step) => (
              <StepItem key={step.id} step={step} completed />
            ))}
          </div>
        )}
      </div>

      {/* Bottom: Timer Button */}
      {task.column !== 'done' && (
        <div className="flex justify-center pt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onStartFocus();
            }}
            className={cn(
              'w-12 h-12 rounded-full',
              'bg-primary text-primary-foreground',
              'flex items-center justify-center',
              'shadow-lg hover:shadow-xl',
              'hover:scale-105 active:scale-95',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2'
            )}
          >
            <Play className="w-5 h-5 ml-0.5" />
          </button>
        </div>
      )}
    </div>
  );
}

interface StepItemProps {
  step: Step;
  onToggle?: () => void;
  completed?: boolean;
}

function StepItem({ step, onToggle, completed }: StepItemProps) {
  return (
    <div className="flex items-center gap-2 group">
      <Checkbox
        checked={step.completed || completed}
        onCheckedChange={onToggle}
        disabled={completed}
        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      <span
        className={cn(
          'text-sm flex-1',
          (step.completed || completed) && 'line-through text-muted-foreground'
        )}
      >
        {step.text}
      </span>
    </div>
  );
}
