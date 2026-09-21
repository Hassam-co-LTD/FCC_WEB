export interface ChatRequest {
  question: string;
  conversationId?: string;
}

export interface ChatResponse {
  answer: string;
  sources: string[];
  conversationId: string;
}

export interface IngestResult {
  indexedChunks: number;
}

export interface ChatMessage {
  role: 'user' | 'assistant';
  text: string;
  sources?: string[];
  timestamp: Date;
  isError?: boolean;
}
