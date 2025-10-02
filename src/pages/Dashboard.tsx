import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { HeroButton } from "@/components/ui/hero-button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  GraduationCap, BookOpen, MessageSquare, Users, FileText, Plus, TrendingUp, Settings, LogOut, Globe, Lock
} from "lucide-react";
import { getSubjectsByRole } from "@/lib/mock-data";
import { Subject } from "@/types";
import { getCurrentUser, clearCurrentUser } from "@/lib/auth";

type Role = "PROFESSOR" | "ALUNO";

const Dashboard = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState<{ name: string; email: string; role: Role }>({
    name: "Visitante",
    email: "",
    role: "ALUNO",
  });

  useEffect(() => {
    const u = getCurrentUser();
    if (!u) {
      navigate("/login");
    } else {
      setUser(u);
      // compat com componentes legados
      localStorage.setItem("role", u.role.toLowerCase());
    }
  }, [navigate]);

  const subjects: Subject[] = useMemo(() => {
    try {
      const r = getSubjectsByRole?.(user.role);
      return Array.isArray(r) ? r : [];
    } catch {
      return [];
    }
  }, [user.role]);

  const totalArquivos = useMemo(
    () => subjects.reduce((acc, s) => acc + (s._count?.sources || 0), 0),
    [subjects]
  );
  const totalPerguntas = useMemo(
    () => subjects.reduce((acc, s) => acc + (s._count?.chatMessages || 0), 0),
    [subjects]
  );

  const SubjectCard = ({ subject }: { subject: Subject }) => (
    <Card className="hover:shadow-elegant transition-all duration-300 group cursor-pointer">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <CardTitle className="text-lg group-hover:text-primary transition-colors">{subject.name}</CardTitle>
            <CardDescription className="text-sm">{subject.description}</CardDescription>
          </div>

          <div className="flex items-center gap-2">
            {subject.isPublic ? (
              <Badge variant="secondary" className="gap-1">
                <Globe className="h-3 w-3" />
                Pública
              </Badge>
            ) : (
              <Badge variant="outline" className="gap-1">
                <Lock className="h-3 w-3" />
                Privada
              </Badge>
            )}

            {/* ✅ botão simples para aluno (abre chat) */}
            {user.role === "ALUNO" && (
              <Button
                size="sm"
                variant="secondary"
                onClick={() => navigate(`/chat?subjectId=${subject.id}`)}
              >
                <MessageSquare className="mr-2 h-4 w-4" />
                Perguntar
              </Button>
            )}
          </div>
        </div>
      </CardHeader>

      <CardContent className="pt-0">
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1">
              <FileText className="h-4 w-4" />
              {subject._count?.sources || 0} arquivos
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="h-4 w-4" />
              {subject._count?.chatMessages || 0} perguntas
            </span>
          </div>

          {/* ✅ agora o botão fantasma realmente navega:
               - Professor: vai para gerenciamento de arquivos
               - Aluno: vai para o chat da matéria */}
          <Button
            variant="ghost"
            size="sm"
            className="opacity-0 group-hover:opacity-100 transition-opacity"
            onClick={() =>
              user.role === "PROFESSOR"
                ? navigate(`/subjects/${subject.id}`)
                : navigate(`/chat?subjectId=${subject.id}`)
            }
          >
            {user.role === "PROFESSOR" ? "Gerenciar" : "Acessar"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  const StatsCard = ({ title, value, icon: Icon, description }: {
    title: string; value: string | number; icon: any; description: string;
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        <p className="text-xs text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card/50 backdrop-blur-sm sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-primary rounded-lg"><GraduationCap className="h-6 w-6 text-white" /></div>
              <div>
                <h1 className="text-xl font-bold">Professor Online</h1>
                <p className="text-sm text-muted-foreground">Bem-vindo, {user.name}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={user.role === "PROFESSOR" ? "default" : "secondary"}>
                {user.role === "PROFESSOR" ? "Professor" : "Aluno"}
              </Badge>
              <Button variant="ghost" size="icon"><Settings className="h-4 w-4" /></Button>
              <Button variant="ghost" size="icon" onClick={() => { clearCurrentUser(); navigate("/login"); }}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-8">
          <StatsCard title="Total de Matérias" value={subjects.length} icon={BookOpen}
            description={user.role === "PROFESSOR" ? "Criadas por você" : "Disponíveis para acesso"} />
          <StatsCard title="Arquivos Processados" value={totalArquivos} icon={FileText} description="PDFs, PPTs e imagens" />
          <StatsCard title="Perguntas Feitas" value={totalPerguntas} icon={MessageSquare} description="Total de interações" />
          <StatsCard title="Taxa de Sucesso" value="94%" icon={TrendingUp} description="Respostas encontradas" />
        </div>

        <Tabs defaultValue="subjects" className="space-y-6">
          <div className="flex items-center justify-between">
            <TabsList>
              <TabsTrigger value="subjects">{user.role === "PROFESSOR" ? "Minhas Matérias" : "Matérias Disponíveis"}</TabsTrigger>
              <TabsTrigger value="recent">Atividade Recente</TabsTrigger>
            </TabsList>
            {user.role === "PROFESSOR" && (
              <HeroButton variant="hero" className="gap-2"><Plus className="h-4 w-4" />Nova Matéria</HeroButton>
            )}
          </div>

          <TabsContent value="subjects" className="space-y-6">
            {subjects.length === 0 ? (
              <Card className="text-center py-12">
                <CardContent>
                  <BookOpen className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <CardTitle className="mb-2">{user.role === "PROFESSOR" ? "Nenhuma matéria criada ainda" : "Nenhuma matéria disponível"}</CardTitle>
                  <CardDescription className="mb-4">
                    {user.role === "PROFESSOR"
                      ? "Crie sua primeira matéria e comece a adicionar materiais de estudo."
                      : "Aguarde até que professores tornem suas matérias públicas."}
                  </CardDescription>
                  {user.role === "PROFESSOR" && (
                    <HeroButton variant="hero"><Plus className="h-4 w-4 mr-2" />Criar Primeira Matéria</HeroButton>
                  )}
                </CardContent>
              </Card>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {subjects.map((subject) => <SubjectCard key={subject.id} subject={subject} />)}
              </div>
            )}
          </TabsContent>

          <TabsContent value="recent" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Atividade Recente</CardTitle>
                <CardDescription>Últimas interações e atualizações</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <MessageSquare className="h-4 w-4 text-primary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Nova pergunta em Matemática</p>
                      <p className="text-xs text-muted-foreground">Há 2 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <FileText className="h-4 w-4 text-success" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">Arquivo processado: geometria-plana.pdf</p>
                      <p className="text-xs text-muted-foreground">Há 4 horas</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                    <Users className="h-4 w-4 text-secondary" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">3 novos alunos acessaram Física</p>
                      <p className="text-xs text-muted-foreground">Ontem</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
