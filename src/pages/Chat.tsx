import { useState, useRef, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import {
  Send, Bot, User, FileText, Globe, BookOpen, ArrowLeft, Settings, Eye, AlertCircle
} from 'lucide-react';
import { mockSubjects, currentUser } from '@/lib/mock-data';
import { ChatMessage, Citation } from '@/types';
import { useToast } from '@/hooks/use-toast';
import { sendChatStreaming, sendChatNonStreaming, type ChatMsg, type BareCitation } from '@/services/chatService';

const Chat = () => {
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const subjectId = params.get('subjectId') || mockSubjects[0].id;
  const subject = mockSubjects.find(s => s.id === subjectId) ?? mockSubjects[0];

  const [messages, setMessages] = useState<ChatMessage[]>([]); // começa vazio (real)
  const [newMessage, setNewMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [allowWebSearch, setAllowWebSearch] = useState(false); // por enquanto só UI
  const [showSources, setShowSources] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();

  const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  useEffect(() => { scrollToBottom(); }, [messages]);

  // Mapeia seu estado (ChatMessage) para o formato da API (ChatMsg)
  const toApiHistory = (arr: ChatMessage[]): ChatMsg[] =>
    arr.filter(m => m.role === 'user' || m.role === 'assistant')
       .map(m => ({ role: m.role, content: m.content }));

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || isLoading) return;

    const now = new Date().toISOString();
    const userMsg: ChatMessage = {
      id: `${Date.now()}`,
      subjectId: subject.id,
      userId: currentUser.id,
      user: currentUser,
      role: 'user',
      content: newMessage.trim(),
      createdAt: now
    };

    const assistantId = `a-${Date.now() + 1}`;
    const assistantPlaceholder: ChatMessage = {
      id: assistantId,
      subjectId: subject.id,
      role: 'assistant',
      content: '',
      createdAt: now
    };

    setMessages(prev => [...prev, userMsg, assistantPlaceholder]);
    setNewMessage('');
    setIsLoading(true);

    try {
      // STREAMING primeiro
      let acc = '';
      await sendChatStreaming(
        subject.id,
        [...toApiHistory(messages), { role: 'user', content: userMsg.content }],
        (token) => {
          acc += token;
          setMessages(prev =>
            prev.map(m => (m.id === assistantId ? { ...m, content: acc } : m))
          );
        },
        (rawCits?: BareCitation[]) => {
          if (!rawCits?.length) return;
          const mapped: Citation[] = rawCits.map(c => ({
            type: 'local',
            file: c.file,
            page: c.page,
            snippet: c.snippet
          }));
          setMessages(prev =>
            prev.map(m => (m.id === assistantId ? { ...m, citations: mapped } : m))
          );
        }
      );
    } catch {
      // Fallback não-stream
      try {
        const resp = await sendChatNonStreaming(subject.id, [...toApiHistory(messages), { role: 'user', content: userMsg.content }]);
        const mapped: Citation[] | undefined = resp.citations?.map(c => ({
          type: 'local', file: c.file, page: c.page, snippet: c.snippet
        }));
        setMessages(prev =>
          prev.map(m => (m.id === assistantId ? { ...m, content: resp.content, citations: mapped } : m))
        );
      } catch {
        setMessages(prev =>
          prev.map(m => (m.id === assistantId ? { ...m, content: "Falha ao obter resposta da IA." } : m))
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  const CitationBadge = ({ citation }: { citation: Citation }) => (
    <Badge
      variant={citation.type === 'local' ? 'default' : 'secondary'}
      className="gap-1 cursor-pointer hover:bg-primary/20 transition-colors"
      onClick={() => {
        toast({
          title: "Visualizar fonte",
          description: citation.type === 'local'
            ? `${citation.file}, página ${citation.page}`
            : citation.title || citation.url
        });
      }}
    >
      {citation.type === 'local' ? (
        <>
          <FileText className="h-3 w-3" />
          {citation.file} (p. {citation.page})
        </>
      ) : (
        <>
          <Globe className="h-3 w-3" />
          Web
        </>
      )}
    </Badge>
  );

  const MessageBubble = ({ message }: { message: ChatMessage }) => {
    const isUser = message.role === 'user';
    return (
      <div className={`flex gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
        <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
          isUser ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground'
        }`}>
          {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
        </div>

        <div className={`flex-1 max-w-[80%] space-y-2 ${isUser ? 'flex flex-col items-end' : ''}`}>
          <div className={`rounded-lg px-4 py-3 ${isUser ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'}`}>
            <p className="whitespace-pre-wrap">{message.content}</p>
          </div>

          {message.citations?.length ? (
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                {message.citations.map((c, i) => <CitationBadge key={i} citation={c} />)}
              </div>
              {message.confidence && (
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <AlertCircle className="h-3 w-3" />
                  Confiança: {Math.round(message.confidence * 100)}%
                </div>
              )}
            </div>
          ) : null}
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar - Sources */}
      {showSources && (
        <div className="w-80 border-r bg-card/50 backdrop-blur-sm">
          <div className="p-4 border-b">
            <h3 className="font-semibold flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              Fontes da Matéria
            </h3>
            <p className="text-sm text-muted-foreground mt-1">Materiais processados</p>
          </div>

          <div className="p-4 space-y-3">
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">algebra-basica.pdf</span>
              </div>
              <div className="text-xs text-muted-foreground">15 páginas • Processado</div>
            </div>
            <div className="p-3 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                <FileText className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">geometria-plana.pdf</span>
              </div>
              <div className="text-xs text-muted-foreground">22 páginas • Processado</div>
            </div>
          </div>
        </div>
      )}

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="border-b bg-card/50 backdrop-blur-sm p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <div>
                <h1 className="text-lg font-semibold">{subject.name}</h1>
                <p className="text-sm text-muted-foreground">Chat com IA • {messages.length} mensagens</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button variant="ghost" size="icon" onClick={() => setShowSources(!showSources)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon">
                <Settings className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 mt-4 pt-4 border-t">
            <div className="flex items-center space-x-2">
              <Switch id="web-search" checked={allowWebSearch} onCheckedChange={setAllowWebSearch} />
              <Label htmlFor="web-search" className="text-sm">Incluir pesquisa web</Label>
            </div>
            {allowWebSearch && (
              <Badge variant="outline" className="gap-1">
                <Globe className="h-3 w-3" />
                Busca web ativa
              </Badge>
            )}
          </div>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {messages.map((message) => <MessageBubble key={message.id} message={message} />)}
          {isLoading && (
            <div className="flex gap-3">
              <div className="w-8 h-8 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center">
                <Bot className="h-4 w-4" />
              </div>
              <div className="bg-muted rounded-lg px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-75" />
                  <div className="w-2 h-2 bg-primary rounded-full animate-pulse delay-150" />
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t bg-card/50 backdrop-blur-sm p-4">
          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Faça sua pergunta sobre o conteúdo da matéria..."
              disabled={isLoading}
              className="flex-1"
            />
            <Button type="submit" disabled={isLoading || !newMessage.trim()} className="gap-2">
              <Send className="h-4 w-4" />
              Enviar
            </Button>
          </form>
          <p className="text-xs text-muted-foreground mt-2">
            A IA responderá com base nos materiais da matéria.
            {allowWebSearch && " Busca web habilitada para informações complementares."}
          </p>
        </div>
      </div>
    </div>
  );
};

export default Chat;
