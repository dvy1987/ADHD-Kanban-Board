export interface Step {
  id: string;
  text: string;
  completed: boolean;
}

export interface Task {
  id: string;
  title: string;
  impactStars: 1 | 2 | 3;
  nextSteps: Step[];
  completedSteps: Step[];
  column: 'todo' | 'inProgress' | 'done';
}

export type ColumnId = 'todo' | 'inProgress' | 'done';

export interface Column {
  id: ColumnId;
  title: string;
}
