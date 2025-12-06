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

  // Mediterranean sun glint - peaceful, not celebratory
  const fireSunGlint = useCallback(() => {
    if (celebrationFired.current) return;
    celebrationFired.current = true;

    const colors = ['#7BBFDB', '#9ED4EA', '#A8D8E8', '#F8E8C8', '#FDF5E6'];
    
    // Gentle center burst - like sun glinting off water
    confetti({
      particleCount: 40,
      spread: 70,
      origin: { y: 0.5 },
      colors: colors,
      gravity: 0.5,
      ticks: 120,
      scalar: 0.7,
      shapes: ['circle'],
      disableForReducedMotion: true,
    });

    // Soft side glints
    setTimeout(() => {
      confetti({
        particleCount: 20,
        angle: 60,
        spread: 40,
        origin: { x: 0.3, y: 0.5 },
        colors: colors,
        gravity: 0.4,
        ticks: 100,
        scalar: 0.6,
        shapes: ['circle'],
        disableForReducedMotion: true,
      });
      confetti({
        particleCount: 20,
        angle: 120,
        spread: 40,
        origin: { x: 0.7, y: 0.5 },
        colors: colors,
        gravity: 0.4,
        ticks: 100,
        scalar: 0.6,
        shapes: ['circle'],
        disableForReducedMotion: true,
      });
    }, 150);
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

  // Fire sun glint when timer completes
  useEffect(() => {
    if (timerCompleted && showSummary) {
      fireSunGlint();
    }
  }, [timerCompleted, showSummary, fireSunGlint]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = totalDuration > 0 ? ((totalDuration - timeLeft) / totalDuration) * 100 : 0;

  const adjustTime = (minutes: number) => {
    const newTime = Math.max(60, timeLeft + minutes * 60);
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
      {/* Backdrop - Limewash alcove with reflected sea light */}
      <div
        className="absolute inset-0 backdrop-blur-sm"
        onClick={handleClose}
        style={{
          background: 'radial-gradient(circle at 50% 0%, hsl(200 30% 92% / 0.95), hsl(200 25% 97% / 0.98))',
        }}
      />

      {/* Content - Enlarged limewash tile */}
      <div 
        className="relative z-10 w-full max-w-lg mx-4 bg-card rounded-3xl overflow-hidden limewash-card"
        style={{
          boxShadow: '0 24px 48px hsl(209 21% 21% / 0.12), 0 0 0 1px hsl(200 30% 88% / 0.5)',
        }}
      >
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-2 rounded-full hover:bg-muted/40 transition-colors duration-200 z-20"
        >
          <X className="w-5 h-5 text-muted-foreground" />
        </button>

        <div className="p-8">
          {/* Task Title */}
          <h2 className="text-xl font-medium text-center text-card-foreground mb-8 leading-snug">
            {task.title}
          </h2>

          {!showSummary ? (
            <>
              {/* Timer Circle - Cerulean/Azure gradient ring */}
              <div className="flex justify-center mb-6">
                <div className="relative w-52 h-52">
                  {/* Background Circle */}
                  <svg className="w-full h-full transform -rotate-90">
                    <defs>
                      <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="hsl(195 65% 65%)" />
                        <stop offset="100%" stopColor="hsl(200 55% 55%)" />
                      </linearGradient>
                    </defs>
                    <circle
                      cx="104"
                      cy="104"
                      r="96"
                      fill="none"
                      stroke="hsl(200 22% 88%)"
                      strokeWidth="6"
                    />
                    {/* Progress Circle - Tide-like fill */}
                    <circle
                      cx="104"
                      cy="104"
                      r="96"
                      fill="none"
                      stroke="url(#timerGradient)"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={603}
                      strokeDashoffset={603 - (603 * progress) / 100}
                      className="transition-all duration-1000"
                      style={{
                        filter: 'drop-shadow(0 0 8px hsl(200 55% 55% / 0.3))',
                      }}
                    />
                  </svg>
                  {/* Time Display */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <span className="text-4xl font-mono font-medium text-card-foreground tracking-tight">
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
                  className="h-8 px-3 border-border/60 hover:bg-muted/40"
                >
                  <Minus className="w-3 h-3 mr-1" />
                  5m
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustTime(-1)}
                  disabled={timeLeft <= 60}
                  className="h-8 px-3 border-border/60 hover:bg-muted/40"
                >
                  <Minus className="w-3 h-3 mr-1" />
                  1m
                </Button>
                <span className="text-xs text-muted-foreground px-2">adjust</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustTime(1)}
                  className="h-8 px-3 border-border/60 hover:bg-muted/40"
                >
                  <Plus className="w-3 h-3 mr-1" />
                  1m
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => adjustTime(5)}
                  className="h-8 px-3 border-border/60 hover:bg-muted/40"
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
                    'hover:scale-105 active:scale-95',
                    'transition-all duration-200'
                  )}
                  style={{
                    boxShadow: '0 8px 24px hsl(200 55% 55% / 0.3)',
                  }}
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
                      'hover:scale-105 active:scale-95',
                      'transition-all duration-200'
                    )}
                    style={{
                      boxShadow: '0 4px 12px hsl(209 21% 21% / 0.1)',
                    }}
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
                <div className="text-center py-4 bg-primary/10 rounded-2xl mb-4 border border-primary/20">
                  <p className="text-lg font-medium text-primary">Well done</p>
                  <p className="text-sm text-muted-foreground mt-1">Focus session complete</p>
                </div>
              )}

              <div>
                <h3 className="text-sm font-medium text-card-foreground mb-3">
                  What did you complete?
                </h3>
                <div className="space-y-2.5 max-h-32 overflow-y-auto">
                  {task.nextSteps.map((step) => (
                    <div key={step.id} className="flex items-center gap-2.5">
                      <Checkbox
                        checked={completedStepIds.includes(step.id)}
                        onCheckedChange={() => toggleStepCompletion(step.id)}
                      />
                      <span className="text-sm">{step.text}</span>
                    </div>
                  ))}
                  {newCompletedSteps.map((step, index) => (
                    <div key={`new-completed-${index}`} className="flex items-center gap-2.5 text-sm text-primary">
                      <Check className="w-4 h-4" />
                      {step}
                    </div>
                  ))}
                </div>
                <div className="flex gap-2 mt-3">
                  <Input
                    value={newCompletedInput}
                    onChange={(e) => setNewCompletedInput(e.target.value)}
                    placeholder="Add something you completed..."
                    className="flex-1 bg-background/60"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') addNewCompletedStep();
                    }}
                  />
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={addNewCompletedStep}
                    className="border-border/60"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-card-foreground mb-3">
                  What are the next steps?
                </h3>
                <div className="space-y-2.5">
                  {newSteps.map((step, index) => (
                    <div
                      key={index}
                      className="flex items-center gap-2.5 text-sm text-muted-foreground"
                    >
                      <span className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center text-xs text-primary font-medium">
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
                      className="flex-1 bg-background/60"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addNewStep();
                      }}
                    />
                    <Button
                      size="icon"
                      variant="outline"
                      onClick={addNewStep}
                      className="border-border/60"
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
                style={{
                  boxShadow: '0 4px 16px hsl(200 55% 55% / 0.25)',
                }}
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