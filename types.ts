export interface Team {
  id: string;
  name: string;
  code: string;
  rank: number;
  winRate: number;
  gamesBehind: number;
  color: string;
  ticketUrl?: string;
}

export interface Feature {
  id: string;
  category: string;
  title: string;
  description: string;
}

export interface TickerItem {
  id: string;
  type: 'TREND' | 'SPEED' | 'PREDICTION' | 'TICKET';
  text: string;
  value?: string;
  highlight?: boolean;
}