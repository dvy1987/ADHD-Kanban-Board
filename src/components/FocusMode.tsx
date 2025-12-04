import { useState, useEffect, useCallback, useRef } from 'react';
import { X, Play, Pause, Square, Plus, Check, Minus } from 'lucide-react';
import { Task, Step } from '@/types/task';
import { cn } from '@/lib/utils';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import confetti from 'canvas-confetti';

interface FocusModeProps {
  task: Task;
  onClose: () => void;
  onComplete: (completedStepIds: string[], newNextSteps: string[], newCompletedSteps: string[]) => void;
}

const DEFAULT_DURATION = 20 * 60; // 20 minutes in seconds

export function FocusMode({ task, onClose, onComplete }: FocusModeProps) {
  const [totalDuration, setTotalDuration] = useState(DEFAULT_DURATION);
  const [timeLeft, setTimeLeft] = useState(DEFAULT_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const [showSummary, setShowSummary] = useState(false);
  const [completedStepIds, setCompletedStepIds] = useState<string[]>([]);
  const [newSteps, setNewSteps] = useState<string[]>([]);
  const [newStepInput, setNewStepInput] = useState('');
  const [newCompletedSteps, setNewCompletedSteps] = useState<string[]>([]);
  const [newCompletedInput, setNewCompletedInput] = useState('');
  const [timerCompleted, setTimerCompleted] = useState(false);
  const celebrationFired = useRef(false);

  // Fire celebration confetti
  const fireCelebration = useCallback(() => {
    if (celebrationFired.current) return;
    celebrationFired.current = true;

    // Multiple bursts for a more celebratory feel
    const duration = 3000;
    const end = Date.now() + duration;

    const colors = ['#10b981', '#3b82f6', '#f59e0b', '#ec4899', '#8b5cf6'];

    (function frame() {
      confetti({
        particleCount: 5,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: colors,
      });
      confetti({
        particleCount: 5,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: colors,
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    })();

    // Big center burst
    setTimeout(() => {
      confetti({
        particleCount: 100,
        spread: 100,
        origin: { y: 0.6 },
        colors: colors,
      });
    }, 200);
  }, []);

  // Handle ESC key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (showSummary) {
          handleFinish();
        } else if (hasStarted) {
          setShowSummary(true);
          setIsRunning(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [showSummary, hasStarted, onClose]);

  // Timer logic
  useEffect(() => {
    if (!isRunning || timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          setIsRunning(false);
          setShowSummary(true);
          setTimerCompleted(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, timeLeft]);

  // Fire celebration when timer completes
  useEffect(() => {
    if (timerCompleted && showSummary) {
      fireCelebration();
    }
  }, [timerCompleted, showSummary, fireCelebration]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

  const adjustTime = (minutes: number) => {
    const newTime = Math.max(60, timeLeft + minutes * 60); // Minimum 1 minute
    setTimeLeft(newTime);
    if (!hasStarted) {
      setTotalDuration(newTime);
    } else {
      setTotalDuration((prev) => Math.max(prev, newTime));
    }
  };

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

  const addNewCompletedStep = () => {
    if (newCompletedInput.trim()) {
      setNewCompletedSteps((prev) => [...prev, newCompletedInput.trim()]);
      setNewCompletedInput('');
    }
  };

  const handleFinish = useCallback(() => {
    onComplete(completedStepIds, newSteps, newCompletedSteps);
    onClose();
  }, [completedStepIds, newSteps, newCompletedSteps, onComplete, onClose]);

  const handleEndSession = () => {
    setIsRunning(false);
    setShowSummary(true);
  };

  const handleStart = () => {
    setIsRunning(true);
    setHasStarted(true);
  };

  const handleClose = () => {
    if (hasStarted) {
      setShowSummary(true);
      setIsRunning(false);
    } else {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center animate-fade-in">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/80 backdrop-blur-sm"
        onClick={handleClose}
      />

      {/* Content */}
      <div className="relative z-10 w-full max-w-lg mx-4 bg-card rounded-3xl shadow-2xl overflow-hidden">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/50 transition-colors z-20"
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
              <div className="flex justify-center mb-6">
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

              {/* Time Adjustment Controls */}
              <div className="flex justify-center items-center gap-3 mb-6">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustTime(-5)}
                  disabled={timeLeft <= 60}
                  className="h-8 px-3"
                >
                  <Minus className="w-3 h-3 mr-1" />
                  5m
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustTime(-1)}
                  disabled={timeLeft <= 60}
                  className="h-8 px-3"
                >
                  <Minus className="w-3 h-3 mr-1" />
                  1m
                </Button>
                <span className="text-xs text-muted-foreground px-2">adjust</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustTime(1)}
                  className="h-8 px-3"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  1m
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustTime(5)}
                  className="h-8 px-3"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  5m
                </Button>
              </div>

              {/* Controls */}
              <div className="flex justify-center gap-4">
                <button
                  onClick={hasStarted ? () => setIsRunning(!isRunning) : handleStart}
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
                {hasStarted && (
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
                )}
              </div>

              <p className="text-center text-sm text-muted-foreground mt-6">
                {hasStarted ? 'Press ESC to end session' : 'Press ESC to close'}
              </p>
            </>
          ) : (
            /* Summary View */
            <div className="space-y-6 animate-fade-in">
              {timerCompleted && (
                <div className="text-center py-4 bg-primary/10 rounded-xl mb-4">
                  <p className="text-2xl mb-1">🎉</p>
                  <p className="text-lg font-semibold text-primary">Great work!</p>
                  <p className="text-sm text-muted-foreground">You completed your focus session!</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-semibold text-card-foreground mb-3">
                  What did you complete?
                </h3>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {task.nextSteps.map((step) => (
                    <div key={step.id} className="flex items-center gap-2">
                      <Checkbox
                        checked={completedStepIds.includes(step.id)}
                        onCheckedChange={() => toggleStepCompletion(step.id)}
                      />
                      <span className="text-sm">{step.text}</span>
                    </div>
                  ))}
                  {newCompletedSteps.map((step, index) => (
                    <div key={`new-completed-${index}`} className="flex items-center gap-2 text-sm text-primary">
                      <Check className="w-4 h-4" />
                      {step}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-2">
                  <Input
                    value={newCompletedInput}
                    onChange={(e) => setNewCompletedInput(e.target.value)}
                    placeholder="Add something you completed..."
                    className="flex-1"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addNewCompletedStep();
                    }}
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={addNewCompletedStep}
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
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
