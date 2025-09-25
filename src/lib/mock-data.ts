import { User, Subject, Source, ChatMessage } from '@/types';

export const mockUsers: User[] = [
  {
    id: '1',
    email: 'professor@demo.com',
    name: 'Prof. Ana Silva',
    role: 'PROFESSOR',
    createdAt: '2024-01-15T10:00:00Z'
  },
  {
    id: '2',
    email: 'aluno@demo.com',
    name: 'João Santos',
    role: 'ALUNO',
    createdAt: '2024-01-20T14:30:00Z'
  }
];

export const mockSubjects: Subject[] = [
  {
    id: '1',
    ownerId: '1',
    owner: mockUsers[0],
    name: 'Matemática - 1º Ano',
    description: 'Fundamentos de matemática para o primeiro ano do ensino médio. Álgebra, geometria básica e funções.',
    isPublic: true,
    createdAt: '2024-01-15T10:30:00Z',
    _count: { sources: 3, chatMessages: 45 }
  },
  {
    id: '2',
    ownerId: '1',
    owner: mockUsers[0],
    name: 'Física - Mecânica',
    description: 'Introdução à mecânica clássica. Cinemática, dinâmica e leis de Newton.',
    isPublic: true,
    createdAt: '2024-01-16T09:15:00Z',
    _count: { sources: 2, chatMessages: 28 }
  },
  {
    id: '3',
    ownerId: '1',
    owner: mockUsers[0],
    name: 'Química - Introdução',
    description: 'Conceitos básicos de química geral. Tabela periódica, ligações químicas e reações.',
    isPublic: false,
    createdAt: '2024-01-17T11:00:00Z',
    _count: { sources: 4, chatMessages: 12 }
  }
];

export const mockSources: Source[] = [
  {
    id: '1',
    subjectId: '1',
    filename: 'algebra-basica.pdf',
    storagePath: 'sources/1/algebra-basica.pdf',
    fileType: 'pdf',
    pages: 15,
    status: 'PROCESSED',
    createdAt: '2024-01-15T11:00:00Z',
    processedAt: '2024-01-15T11:05:00Z'
  },
  {
    id: '2',
    subjectId: '1',
    filename: 'geometria-plana.pdf',
    storagePath: 'sources/1/geometria-plana.pdf',
    fileType: 'pdf',
    pages: 22,
    status: 'PROCESSED',
    createdAt: '2024-01-15T11:30:00Z',
    processedAt: '2024-01-15T11:35:00Z'
  },
  {
    id: '3',
    subjectId: '2',
    filename: 'cinematica.pptx',
    storagePath: 'sources/2/cinematica.pptx',
    fileType: 'pptx',
    pages: 18,
    status: 'PROCESSING',
    createdAt: '2024-01-16T10:00:00Z'
  }
];

export const mockChatMessages: ChatMessage[] = [
  {
    id: '1',
    subjectId: '1',
    userId: '2',
    user: mockUsers[1],
    role: 'user',
    content: 'O que é uma função quadrática?',
    createdAt: '2024-01-25T14:00:00Z'
  },
  {
    id: '2',
    subjectId: '1',
    role: 'assistant',
    content: 'Uma função quadrática é uma função polinomial de segundo grau, ou seja, uma função da forma f(x) = ax² + bx + c, onde a, b e c são números reais e a ≠ 0. Ela tem as seguintes características principais:\n\n• Seu gráfico é uma parábola\n• Possui um ponto de máximo ou mínimo (vértice)\n• Pode ter até duas raízes reais\n\nExemplo: f(x) = x² - 4x + 3',
    citations: [
      {
        type: 'local',
        file: 'algebra-basica.pdf',
        page: 8,
        snippet: 'Função quadrática é definida como f(x) = ax² + bx + c...'
      }
    ],
    confidence: 0.89,
    createdAt: '2024-01-25T14:00:05Z'
  }
];

export const currentUser = mockUsers[0]; // Professor por padrão

export const getSubjectsByRole = (role: 'PROFESSOR' | 'ALUNO') => {
  if (role === 'PROFESSOR') {
    return mockSubjects.filter(s => s.ownerId === currentUser.id);
  }
  return mockSubjects.filter(s => s.isPublic);
};