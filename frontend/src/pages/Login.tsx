import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Server, Lock, User, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { login, getMe } from "@/api/axios";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const setAuth = useAuthStore(state => state.setAuth);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);
    
    try {
      const data = await login({ username, password });
      const user = await getMe(data.access_token);
      setAuth(data.access_token, user);
      navigate("/");
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erro ao conectar com o servidor.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[100px]" />
      
      <Card className="w-full max-w-md z-10 border-primary/20 shadow-2xl backdrop-blur-sm bg-card/95">
        <CardHeader className="space-y-3 text-center pb-6">
          <div className="mx-auto w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-2">
            <Server className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl font-bold tracking-tight">Feitosa AD</CardTitle>
          <CardDescription>Painel de Controle do Samba Directory</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md border border-destructive/20 text-center animate-in fade-in zoom-in-95">
                {error}
              </div>
            )}
            
            <div className="space-y-2 relative">
              <div className="absolute left-3 top-2.5 text-muted-foreground">
                <User className="h-5 w-5" />
              </div>
              <Input 
                type="text" 
                placeholder="Usuário" 
                className="pl-10"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                autoComplete="username"
                required
              />
            </div>
            
            <div className="space-y-2 relative">
              <div className="absolute left-3 top-2.5 text-muted-foreground">
                <Lock className="h-5 w-5" />
              </div>
              <Input 
                type="password" 
                placeholder="Senha" 
                className="pl-10"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            <Button type="submit" className="w-full mt-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Entrar"}
            </Button>
          </form>
        </CardContent>
        <CardFooter className="justify-center border-t p-4 mt-4">
          <p className="text-xs text-muted-foreground">
            &copy; 2026 Feitosa Soluções em Informática
          </p>
        </CardFooter>
      </Card>
    </div>
  );
}
