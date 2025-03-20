export interface Todo {
    id: string;
    title: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    dueDate: Date;
    createdAt: Date;
    completed: boolean;
  }