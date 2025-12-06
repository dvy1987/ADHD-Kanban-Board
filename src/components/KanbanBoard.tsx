import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  PointerSensor,
  useSensor,
  useSensors,
  DragStartEvent,
  DragEndEvent,
} from '@dnd-kit/core';
import confetti from 'canvas-confetti';
import { Task, ColumnId, Column } from '@/types/task';
import { useTasks } from '@/hooks/useTasks';
import { KanbanColumn } from './KanbanColumn';
import { TaskCard } from './TaskCard';
import { FocusMode } from './FocusMode';

const columns: Column[] = [
  { id: 'todo', title: 'To Do' },
  { id: 'inProgress', title: 'In Progress' },
  { id: 'done', title: 'Done' },
];

export function KanbanBoard() {
  const {
    tasks,
    moveTask,
    updateTask,
    toggleStep,
    addStep,
    completeSessionSteps,
    getTasksByColumn,
  } = useTasks();

  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [focusTask, setFocusTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  // Mediterranean sun glint - subtle cerulean + pale gold particles
  const triggerSunGlint = useCallback(() => {
    const colors = ['#7BBFDB', '#9ED4EA', '#A8D8E8', '#F8E8C8', '#FDF5E6'];
    
    confetti({
      particleCount: 35,
      spread: 60,
      origin: { y: 0.6 },
      colors: colors,
      gravity: 0.6,
      ticks: 150,
      scalar: 0.8,
      shapes: ['circle'],
      disableForReducedMotion: true,
    });
  }, []);

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const task = tasks.find((t) => t.id === active.id);
    if (task) setActiveTask(task);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const taskId = active.id as string;
    const task = tasks.find((t) => t.id === taskId);
    if (!task) return;

    // Determine target column
    let targetColumn: ColumnId;
    
    // Check if dropped on a column
    if (['todo', 'inProgress', 'done'].includes(over.id as string)) {
      targetColumn = over.id as ColumnId;
    } else {
      // Dropped on another task - find its column
      const overTask = tasks.find((t) => t.id === over.id);
      if (overTask) {
        targetColumn = overTask.column;
      } else {
        return;
      }
    }

    if (task.column !== targetColumn) {
      moveTask(taskId, targetColumn);
      
      // Trigger sun glint when moving to Done
      if (targetColumn === 'done') {
        setTimeout(triggerSunGlint, 100);
      }
    }
  };

  const handleStartFocus = (taskId: string) => {
    const task = tasks.find((t) => t.id === taskId);
    if (task) setFocusTask(task);
  };

  const handleCompleteFocus = (completedStepIds: string[], newNextSteps: string[], newCompletedSteps: string[]) => {
    if (focusTask) {
      completeSessionSteps(focusTask.id, completedStepIds, newNextSteps, newCompletedSteps);
    }
  };

  const handleUpdateImpact = (taskId: string, stars: 1 | 2 | 3) => {
    updateTask(taskId, { impactStars: stars });
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 p-6 lg:p-8">
          {columns.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              tasks={getTasksByColumn(column.id)}
              onToggleStep={toggleStep}
              onAddStep={addStep}
              onStartFocus={handleStartFocus}
              onUpdateImpact={handleUpdateImpact}
            />
          ))}
        </div>

        <DragOverlay>
          {activeTask && (
            <div className="rotate-2 scale-[1.02]">
              <TaskCard
                task={activeTask}
                onToggleStep={() => {}}
                onAddStep={() => {}}
                onStartFocus={() => {}}
                onUpdateImpact={() => {}}
              />
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {focusTask && (
        <FocusMode
          task={focusTask}
          onClose={() => setFocusTask(null)}
          onComplete={handleCompleteFocus}
        />
      )}
    </>
  );
}