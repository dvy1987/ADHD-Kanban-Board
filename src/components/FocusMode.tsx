import { useState, useEffect, useCallback } from 'react';
import { X, Play, Pause, Square, Plus, Check } from 'lucide-react';
import { Task, Step } from '@/types/task';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

interface FocusModeProps {
  task: Task;
  onClose: () => void;
  onComplete: (completedStepIds: string[], newNextSteps: string[]) => void;
}

const FOCUS_DURATION = 20 * 60; // 20 minutes in seconds

export function FocusMode({ task, onClose, onComplete }: FocusModeProps) {
  const [timeLeft, setTimeLeft] = useState(FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [newSteps, setNewSteps] = useState<string[]>([]);
  const [newStepInput, setNewStepInput] = useState('');

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSummary) {
          handleFinish();
        } else {
          setShowSummary(true);
          setIsRunning(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSummary]);

  // Timer logic
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setShowSummary(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = ((FOCUS_DURATION - timeLeft) / FOCUS_DURATION) * 100;

  const toggleStepCompletion = (stepId: string) => {
    setCompletedStepIds((prev) =>
      prev.includes(stepId)
        ? prev.filter((id) => id !== stepId)
        : [...prev, stepId]
    );
  };

  const addNewStep = () => {
    if (newStepInput.trim()) {
      setNewSteps((prev) => [...prev, newStepInput.trim()]);
      setNewStepInput('');
    }
  };

  const handleFinish = useCallback(() => {
    onComplete(completedStepIds, newSteps);
    onClose();
  }, [completedStepIds, newSteps, onComplete, onClose]);

  const handleEndSession = () => {
    setIsRunning(false);
    setShowSummary(true);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/80 backdrop-blur-sm"
        onClick={() => setShowSummary(true)}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-card rounded-3xl shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={() => setShowSummary(true)}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="p-8">
          {/* Task Title */}
          <h2 className="text-xl font-semibold text-center text-card-foreground mb-8">
            {task.title}
          </h2>

          {!showSummary ? (
            <>
              {/* Timer Circle */}
              <div className="flex justify-center mb-8">
                <div className="relative w-48 h-48">
                  {/* Background Circle */}
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="none"
                      stroke="hsl(var(--muted))"
                      strokeWidth="8"
                    />
                    {/* Progress Circle */}
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      fill="none"
                      stroke="hsl(var(--primary))"
                      strokeWidth="8"
                      strokeLinecap="round"
                      strokeDasharray={553}
                      strokeDashoffset={553 - (553 * progress) / 100}
                      className="transition-all duration-1000"
                    />
                  </svg>
                  {/* Time Display */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-mono font-semibold text-card-foreground">
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={() => setIsRunning(!isRunning)}
                  className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center',
                    'bg-primary text-primary-foreground',
                    'shadow-lg hover:shadow-xl',
                    'hover:scale-105 active:scale-95',
                    'transition-all duration-200'
                  )}
                >
                  {isRunning ? (
                    <Pause className="w-6 h-6" />
                  ) : (
                    <Play className="w-6 h-6 ml-0.5" />
                  )}
                </button>
                <button
                  onClick={handleEndSession}
                  className={cn(
                    'w-14 h-14 rounded-full flex items-center justify-center',
                    'bg-secondary text-secondary-foreground',
                    'shadow-lg hover:shadow-xl',
                    'hover:scale-105 active:scale-95',
                    'transition-all duration-200'
                  )}
                >
                  <Square className="w-5 h-5" />
                </button>
              </div>

              <p className="text-center text-sm text-muted-foreground mt-6">
                Press ESC to end session
              </p>
            </>
          ) : (
            /* Summary View */
            <div className="space-y-6 animate-fade-in">
              <div>
                <h3 className="text-sm font-semibold text-card-foreground mb-3">
                  What did you complete?
                </h3>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {task.nextSteps.map((step) => (
                    <div key={step.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={completedStepIds.includes(step.id)}
                        onCheckedChange={() => toggleStepCompletion(step.id)}
                      />
                      <span className="text-sm">{step.text}</span>
                    </div>
                  ))}
                  {task.nextSteps.length === 0 && (
                    <p className="text-sm text-muted-foreground italic">
                      No steps defined yet
                    </p>
                  )}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-card-foreground mb-3">
                  What are the next steps?
                </h3>
                <div className="space-y-2">
                  {newSteps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2 text-sm text-muted-foreground"
                    >
                      <span className="w-5 h-5 rounded-full bg-primary/20 flex items-center justify-center text-xs text-primary">
                        {index + 1}
                      </span>
                      {step}
                    </div>
                  ))}
                  <div className="flex gap-2">
                    <Input
                      value={newStepInput}
                      onChange={(e) => setNewStepInput(e.target.value)}
                      placeholder="Add a new step..."
                      className="flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addNewStep();
                      }}
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={addNewStep}
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              <Button
                onClick={handleFinish}
                className="w-full"
                size="lg"
              >
                <Check className="w-4 h-4 mr-2" />
                Save & Close
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
