import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { setCurrentUser, Role } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Login() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  function handleDemo(role: Role) {
    setCurrentUser({
      name: role === "PROFESSOR" ? "Prof. Ana Silva" : "Aluno João",
      email: role === "PROFESSOR" ? "prof@example.com" : "aluno@example.com",
      role,
    });
    navigate("/dashboard");
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    // Exemplo simples: se o e-mail contiver "prof", entra como PROFESSOR; caso contrário, ALUNO.
    const role: Role = email.toLowerCase().includes("prof") ? "PROFESSOR" : "ALUNO";
    setCurrentUser({
      name: role === "PROFESSOR" ? "Prof. Ana Silva" : "Aluno",
      email,
      role,
    });
    navigate("/dashboard");
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-sky-500 to-emerald-500 p-6">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">Professor Online</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">E-mail</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Senha</label>
              <Input
                type="password"
                placeholder="••••••••"
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                required
              />
            </div>

            <Button type="submit" className="w-full">Entrar</Button>
          </form>

          {/* Contas de demonstração */}
          <div className="mt-6 grid grid-cols-2 gap-3">
            <Button variant="secondary" onClick={() => handleDemo("PROFESSOR")}>
              Professor (demo)
            </Button>
            <Button variant="secondary" onClick={() => handleDemo("ALUNO")}>
              Aluno (demo)
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
