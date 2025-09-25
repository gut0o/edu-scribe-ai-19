import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { HeroButton } from "@/components/ui/hero-button";
import { Button } from "@/components/ui/button";
import { 
  GraduationCap, 
  BookOpen, 
  MessageSquare, 
  Users, 
  ArrowRight,
  Brain,
  FileText,
  Globe
} from "lucide-react";
import heroEducation from "@/assets/hero-education.jpg";

const Index = () => {
  return (
    <div 
      className="min-h-screen relative"
      style={{
        backgroundImage: `linear-gradient(135deg, rgba(59, 130, 246, 0.9), rgba(16, 185, 129, 0.9)), url(${heroEducation})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed'
      }}
    >
      {/* Hero Section */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center text-white max-w-4xl mx-auto mb-16">
          <div className="flex items-center justify-center mb-8">
            <div className="p-4 bg-white/10 backdrop-blur-sm rounded-3xl">
              <GraduationCap className="h-16 w-16" />
            </div>
          </div>
          
          <h1 className="text-5xl md:text-6xl font-bold mb-6">
            Professor Online
            <span className="block text-white/80 text-2xl md:text-3xl mt-2">
              com Inteligência Artificial
            </span>
          </h1>
          
          <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
            Plataforma educacional inteligente que permite professores criarem matérias e alunos 
            tirarem dúvidas através de chat com IA baseada nos materiais da disciplina.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <HeroButton variant="hero" size="lg" className="gap-2" asChild>
              <a href="/login">
                Começar Agora
                <ArrowRight className="h-5 w-5" />
              </a>
            </HeroButton>
            <Button variant="outline" size="lg" className="gap-2 text-white border-white/20 hover:bg-white/10">
              Ver Demonstração
            </Button>
          </div>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <BookOpen className="h-8 w-8 mb-2 text-primary-glow" />
              <CardTitle>Gestão de Matérias</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/80">
                Professores criam matérias e fazem upload de PDFs, PPTs e imagens
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <Brain className="h-8 w-8 mb-2 text-primary-glow" />
              <CardTitle>IA Contextual</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/80">
                Respostas baseadas exclusivamente nos materiais da matéria via RAG
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <MessageSquare className="h-8 w-8 mb-2 text-primary-glow" />
              <CardTitle>Chat Inteligente</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/80">
                Alunos fazem perguntas e recebem respostas precisas com citações
              </CardDescription>
            </CardContent>
          </Card>

          <Card className="bg-white/10 backdrop-blur-sm border-white/20 text-white">
            <CardHeader>
              <Globe className="h-8 w-8 mb-2 text-primary-glow" />
              <CardTitle>Busca Web</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription className="text-white/80">
                Fallback inteligente para busca web quando necessário
              </CardDescription>
            </CardContent>
          </Card>
        </div>

        {/* How it Works */}
        <div className="max-w-4xl mx-auto text-center text-white mb-16">
          <h2 className="text-3xl md:text-4xl font-bold mb-8">Como Funciona</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto">
                <FileText className="h-8 w-8 text-primary-glow" />
              </div>
              <h3 className="text-xl font-semibold">1. Upload de Materiais</h3>
              <p className="text-white/80">
                Professores fazem upload de PDFs, apresentações e imagens que são processados pela IA
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-secondary/20 rounded-full flex items-center justify-center mx-auto">
                <Brain className="h-8 w-8 text-secondary" />
              </div>
              <h3 className="text-xl font-semibold">2. Processamento IA</h3>
              <p className="text-white/80">
                Sistema extrai e indexa o conteúdo usando embeddings vetoriais para busca semântica
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="w-16 h-16 bg-accent/20 rounded-full flex items-center justify-center mx-auto">
                <MessageSquare className="h-8 w-8 text-accent" />
              </div>
              <h3 className="text-xl font-semibold">3. Chat Contextual</h3>
              <p className="text-white/80">
                Alunos fazem perguntas e recebem respostas baseadas nos materiais com citações precisas
              </p>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 max-w-2xl mx-auto">
            <CardHeader>
              <CardTitle className="text-white text-2xl">
                Pronto para revolucionar o ensino?
              </CardTitle>
              <CardDescription className="text-white/80 text-lg">
                Junte-se à plataforma educacional mais avançada do Brasil
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <HeroButton variant="hero" size="lg" className="w-full" asChild>
                <a href="/login">
                  Começar Gratuitamente
                </a>
              </HeroButton>
              <p className="text-sm text-white/60">
                Contas demo disponíveis: professor@demo.com e aluno@demo.com
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;