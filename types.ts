export enum ViewState {
  HOME = 'HOME',
  DREAMSCAPE = 'DREAMSCAPE',
  CHAT = 'CHAT',
  SHARE = 'SHARE',
  DEV_LOG = 'DEV_LOG'
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export interface LogEntry {
  day: string;
  title: string;
  desc: string;
}

export interface AccentColor {
  name: string;
  hex: string;
  glow: string;
}