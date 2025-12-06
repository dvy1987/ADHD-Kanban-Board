import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Play, Check, Plus } from 'lucide-react';
import { useState, useRef } from 'react';
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
  const [showRipple, setShowRipple] = useState(false);
  const rippleRef = useRef<HTMLSpanElement>(null);

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
    transition: transition || 'transform 200ms cubic-bezier(.22, 1, .36, 1)',
  };

  const handleAddStep = () => {
    if (newStep.trim()) {
      onAddStep(newStep.trim());
      setNewStep('');
      setIsAddingStep(false);
    }
  };

  const handleStartFocus = (e: React.MouseEvent) => {
    e.stopPropagation();
    // Trigger water ripple
    setShowRipple(true);
    setTimeout(() => setShowRipple(false), 400);
    onStartFocus();
  };

  const hasHighImpact = task.impactStars === 3;

  const combinedStyle = {
    ...style,
    boxShadow: isDragging 
      ? '0 16px 32px hsl(209 21% 21% / 0.12)' 
      : '0 6px 16px hsl(209 21% 21% / 0.06)',
  };

  return (
    <div
      ref={setNodeRef}
      style={combinedStyle}
      {...attributes}
      {...listeners}
      className={cn(
        'limewash-card rounded-[14px] p-5 border border-border/40',
        'cursor-grab active:cursor-grabbing',
        'transition-all duration-200',
        'hover:-translate-y-0.5',
        isDragging && 'opacity-60 scale-[1.02] shadow-xl',
        hasHighImpact && 'animate-gentle-glow'
      )}
    >
      {/* Top Row: Title and Stars */}
      <div className="flex items-start justify-between gap-3 mb-4">
        <h3 className="text-base font-medium text-card-foreground truncate flex-1 leading-snug">
          {task.title}
        </h3>
        <ImpactStars count={task.impactStars} onChange={onUpdateImpact} />
      </div>

      {/* Middle: Steps */}
      <div className="space-y-2.5 mb-5">
        {/* Next Steps */}
        {task.nextSteps.length > 0 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
                  className="h-8 text-sm bg-background/60"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddStep();
                    if (e.key === 'Escape') setIsAddingStep(false);
                  }}
                  autoFocus
                />
                <button
                  onClick={handleAddStep}
                  className="p-1.5 rounded-lg bg-primary text-primary-foreground hover:bg-primary/90 transition-colors duration-200"
                >
                  <Check className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => setIsAddingStep(true)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary transition-colors duration-200"
              >
                <Plus className="w-4 h-4" />
                Add step
              </button>
            )}
          </div>
        )}

        {/* Completed Steps */}
        {task.completedSteps.length > 0 && (
          <div className="space-y-2 pt-3 border-t border-border/40">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
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
        <div className="flex justify-center pt-3">
          <button
            onClick={handleStartFocus}
            className={cn(
              'relative w-12 h-12 rounded-full',
              'bg-background border-2 border-primary/60',
              'flex items-center justify-center',
              'hover:border-primary hover:shadow-md',
              'active:scale-95',
              'transition-all duration-200',
              'focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2'
            )}
            style={{
              boxShadow: '0 4px 12px hsl(200 55% 55% / 0.15)',
            }}
          >
            {/* Ripple effect */}
            {showRipple && (
              <span
                ref={rippleRef}
                className="absolute inset-0 rounded-full border-2 border-primary/40 water-ripple"
              />
            )}
            <Play className="w-5 h-5 ml-0.5 text-primary" />
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
    <div className="flex items-center gap-2.5 group">
      <Checkbox
        checked={step.completed || completed}
        onCheckedChange={onToggle}
        disabled={completed}
        className="data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      <span
        className={cn(
          'text-sm flex-1 leading-relaxed',
          (step.completed || completed) && 'line-through text-muted-foreground'
        )}
      >
        {step.text}
      </span>
    </div>
  );
}