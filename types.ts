export enum ViewState {
  UPLOAD = 'UPLOAD',
  DASHBOARD = 'DASHBOARD',
  REMINDERS = 'REMINDERS',
}

export type Theme = 'light' | 'space';

export type ChartType = 'category_pie' | 'merchant_bar' | 'daily_trend' | 'category_count';

export interface ReceiptItem {
  merchant: string;
  date: string;
  total: number;
  category: string;
  description?: string;
}

export interface Reminder {
  id: string;
  title: string;
  date: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export enum AssistantMode {
  IDLE = 'IDLE',
  CHAT = 'CHAT',
  MENU = 'MENU',
}