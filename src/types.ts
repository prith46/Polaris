export interface Task {
  id: string;
  title: string;
  pillText: string;
  urgency: 'high' | 'medium' | 'low';
  context: string;
  primaryAction: string;
  secondaryAction: string;
  subtasks?: Array<{ step: string; minutes: number; completed: boolean }>;
  decomposing?: boolean;
  decomposed?: boolean;
  subtasksCollapsed?: boolean;
  createdAt?: number;
  pointOfNoReturnPassed?: boolean;
}

export interface Email {
  id: string;
  from: string;
  subject: string;
  time: string;
  body: string;
  unread: boolean;
  avatarLetter: string;
  avatarColor: string;
  textColor?: string; // to handle 'text:white' cases
  starred: boolean;
  important: boolean;
  pillText?: string;
  pillBg?: string;
  pillColor?: string;
}

export interface ExtractionLogEntry {
  id: string;
  sourceType: 'email' | 'image';
  sourceName: string;
  taskTitle: string;
  deadline: string;
  urgency: 'high' | 'medium' | 'low';
  taskId: string;
  extractedAt: Date;
}


