export interface Task {
  id: string;
  title: string;
  pillText: string;
  urgency: 'high' | 'medium' | 'low';
  context: string;
  primaryAction: string;
  secondaryAction: string;
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

