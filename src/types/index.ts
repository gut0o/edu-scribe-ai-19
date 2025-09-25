export type User = {
  id: string;
  email: string;
  name: string;
  role: 'PROFESSOR' | 'ALUNO';
  createdAt: string;
}

export type Subject = {
  id: string;
  ownerId: string;
  owner?: User;
  name: string;
  description: string;
  isPublic: boolean;
  createdAt: string;
  _count?: {
    sources: number;
    chatMessages: number;
  };
}

export type Source = {
  id: string;
  subjectId: string;
  filename: string;
  storagePath: string;
  fileType: 'pdf' | 'pptx' | 'jpg' | 'png';
  pages: number;
  status: 'PENDING' | 'PROCESSING' | 'PROCESSED' | 'FAILED';
  createdAt: string;
  processedAt?: string;
}

export type ChatMessage = {
  id: string;
  subjectId: string;
  userId?: string;
  user?: User;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations?: Citation[];
  confidence?: number;
  createdAt: string;
}

export type Citation = {
  type: 'local' | 'web';
  file?: string;
  page?: number;
  url?: string;
  snippet?: string;
  title?: string;
}

export type SubjectSettings = {
  id: string;
  subjectId: string;
  allowWebFallback: boolean;
  confidenceThreshold: number;
  topK: number;
  topN: number;
  maxOutputTokens: number;
}