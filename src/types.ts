export interface User {
  id: string;
  name: string;
  email: string;
  password?: string; // In a real app, never store plain text passwords. This is a mockup.
  bio?: string;
  joinedAt: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}

export interface JournalEntry {
  id: string;
  userId: string;
  title: string;
  content: string;
  timestamp: number;
  emotions: string[];
  isAnalyzed: boolean;
}

export interface MentalHealthResult {
  id: string;
  userId: string;
  date: string;
  score: number;
  interpretation: string;
}

export enum ViewState {
  AUTH = 'AUTH',
  APP = 'APP',
}

export interface Exercise {
  id: string;
  title: string;
  description: string;
  durationSeconds: number;
  steps: string[];
}