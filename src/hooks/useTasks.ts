import { useState } from 'react';
import { Task, Step, ColumnId } from '@/types/task';

const generateId = () => Math.random().toString(36).substr(2, 9);

const initialTasks: Task[] = [
  {
    id: 'task-1',
    title: 'Complete Math Assignment',
    impactStars: 3,
    nextSteps: [
      { id: 'step-1a', text: 'Review chapter 5 formulas', completed: false },
      { id: 'step-1b', text: 'Solve practice problems', completed: false },
      { id: 'step-1c', text: 'Check answers', completed: false },
    ],
    completedSteps: [],
    column: 'todo',
  },
  {
    id: 'task-2',
    title: 'Write English Essay',
    impactStars: 2,
    nextSteps: [
      { id: 'step-2a', text: 'Create outline', completed: false },
      { id: 'step-2b', text: 'Write introduction', completed: false },
      { id: 'step-2c', text: 'Add supporting paragraphs', completed: false },
    ],
    completedSteps: [],
    column: 'todo',
  },
  {
    id: 'task-3',
    title: 'Finish coding homework',
    impactStars: 2,
    nextSteps: [
      { id: 'step-3a', text: 'Debug the login function', completed: false },
      { id: 'step-3b', text: 'Write unit tests', completed: false },
    ],
    completedSteps: [],
    column: 'todo',
  },
  {
    id: 'task-4',
    title: 'Build physics demo',
    impactStars: 3,
    nextSteps: [
      { id: 'step-4a', text: 'Gather materials', completed: false },
      { id: 'step-4b', text: 'Assemble the circuit', completed: false },
    ],
    completedSteps: [
      { id: 'step-4c', text: 'Research project topic', completed: true },
    ],
    column: 'inProgress',
  },
  {
    id: 'task-5',
    title: 'Bake cupcakes for school outing',
    impactStars: 1,
    nextSteps: [],
    completedSteps: [
      { id: 'step-5a', text: 'Buy ingredients', completed: true },
      { id: 'step-5b', text: 'Follow recipe', completed: true },
      { id: 'step-5c', text: 'Decorate cupcakes', completed: true },
    ],
    column: 'done',
  },
];

export function useTasks() {
  const [tasks, setTasks] = useState<Task[]>(initialTasks);

  const moveTask = (taskId: string, newColumn: ColumnId) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, column: newColumn } : task
      )
    );
  };

  const updateTask = (taskId: string, updates: Partial<Task>) => {
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId ? { ...task, ...updates } : task
      )
    );
  };

  const toggleStep = (taskId: string, stepId: string) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        return {
          ...task,
          nextSteps: task.nextSteps.map((step) =>
            step.id === stepId ? { ...step, completed: !step.completed } : step
          ),
        };
      })
    );
  };

  const addStep = (taskId: string, text: string) => {
    const newStep: Step = { id: generateId(), text, completed: false };
    setTasks((prev) =>
      prev.map((task) =>
        task.id === taskId
          ? { ...task, nextSteps: [...task.nextSteps, newStep] }
          : task
      )
    );
  };

  const completeSessionSteps = (
    taskId: string,
    completedStepIds: string[],
    newNextSteps: string[],
    newCompletedSteps: string[] = []
  ) => {
    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        
        const stepsToMove = task.nextSteps.filter((s) =>
          completedStepIds.includes(s.id)
        );
        const remainingSteps = task.nextSteps.filter(
          (s) => !completedStepIds.includes(s.id)
        );
        
        const newSteps: Step[] = newNextSteps.map((text) => ({
          id: generateId(),
          text,
          completed: false,
        }));

        const manuallyAddedCompleted: Step[] = newCompletedSteps.map((text) => ({
          id: generateId(),
          text,
          completed: true,
        }));
        
        return {
          ...task,
          nextSteps: [...remainingSteps, ...newSteps],
          completedSteps: [
            ...task.completedSteps,
            ...stepsToMove.map((s) => ({ ...s, completed: true })),
            ...manuallyAddedCompleted,
          ],
        };
      })
    );
  };

  const getTasksByColumn = (column: ColumnId) =>
    tasks.filter((task) => task.column === column);

  return {
    tasks,
    moveTask,
    updateTask,
    toggleStep,
    addStep,
    completeSessionSteps,
    getTasksByColumn,
  };
}
