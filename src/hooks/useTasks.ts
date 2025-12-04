import { useState } from 'react';
import { Task, Step, ColumnId } from '@/types/task';

const generateId = () => Math.random().toString(36).substr(2, 9);

const initialTasks: Task[] = [
  {
    id: generateId(),
    title: 'Complete Math Assignment',
    impactStars: 3,
    nextSteps: [
      { id: generateId(), text: 'Review chapter 5 formulas', completed: false },
      { id: generateId(), text: 'Solve practice problems', completed: false },
      { id: generateId(), text: 'Check answers', completed: false },
    ],
    completedSteps: [],
    column: 'todo',
  },
  {
    id: generateId(),
    title: 'Write English Essay',
    impactStars: 2,
    nextSteps: [
      { id: generateId(), text: 'Create outline', completed: false },
      { id: generateId(), text: 'Write introduction', completed: false },
      { id: generateId(), text: 'Add supporting paragraphs', completed: false },
    ],
    completedSteps: [],
    column: 'todo',
  },
  {
    id: generateId(),
    title: 'Finish coding homework',
    impactStars: 2,
    nextSteps: [
      { id: generateId(), text: 'Debug the login function', completed: false },
      { id: generateId(), text: 'Write unit tests', completed: false },
    ],
    completedSteps: [],
    column: 'todo',
  },
  {
    id: generateId(),
    title: 'Build physics demo',
    impactStars: 3,
    nextSteps: [
      { id: generateId(), text: 'Gather materials', completed: false },
      { id: generateId(), text: 'Assemble the circuit', completed: false },
    ],
    completedSteps: [
      { id: generateId(), text: 'Research project topic', completed: true },
    ],
    column: 'inProgress',
  },
  {
    id: generateId(),
    title: 'Bake cupcakes for school outing',
    impactStars: 1,
    nextSteps: [],
    completedSteps: [
      { id: generateId(), text: 'Buy ingredients', completed: true },
      { id: generateId(), text: 'Follow recipe', completed: true },
      { id: generateId(), text: 'Decorate cupcakes', completed: true },
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
    newNextSteps: string[]
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
        
        return {
          ...task,
          nextSteps: [...remainingSteps, ...newSteps],
          completedSteps: [
            ...task.completedSteps,
            ...stepsToMove.map((s) => ({ ...s, completed: true })),
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
