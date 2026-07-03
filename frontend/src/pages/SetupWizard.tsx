import React, { useState } from "react";
import { Server, Settings, Globe, HardDrive, Loader2, ArrowLeft } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { provisionDomain, connectDomain } from "@/api/axios";

export function SetupWizard() {
  const [step, setStep] = useState<"choice" | "provision" | "connect">("choice");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Formularios
  const [domainName, setDomainName] = useState("");
  const [adminPassword, setAdminPassword] = useState("");
  const [serverIp, setServerIp] = useState("");
  const [adminUser, setAdminUser] = useState("");

  const handleProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await provisionDomain({ domain_name: domainName, admin_password: adminPassword });
      window.location.href = "/login"; // Force reload to re-check status
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erro ao provisionar domínio.");
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await connectDomain({ 
        server_ip: serverIp, 
        admin_user: adminUser, 
        admin_password: adminPassword,
        domain_name: domainName 
      });
      window.location.href = "/login";
    } catch (err: any) {
      setError(err.response?.data?.detail || "Erro ao conectar ao domínio remoto.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-primary/20 blur-[120px]" />
      
      <div className="w-full max-w-2xl z-10 animate-in fade-in zoom-in-95 duration-500">
        
        {step === "choice" && (
          <div className="space-y-6">
            <div className="text-center space-y-2">
              <div className="mx-auto w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Settings className="h-8 w-8 text-primary" />
              </div>
              <h1 className="text-3xl font-bold tracking-tight">Bem-vindo ao Feitosa AD</h1>
              <p className="text-muted-foreground text-lg">O sistema não está configurado. Como deseja prosseguir?</p>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 mt-8">
              <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-md group" onClick={() => setStep("provision")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <HardDrive className="h-6 w-6 text-blue-500 group-hover:scale-110 transition-transform" />
                    Provisionar Novo Domínio
                  </CardTitle>
                  <CardDescription>
                    Criar um novo controlador de domínio Samba AD do zero neste servidor.
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="cursor-pointer hover:border-primary/50 transition-all shadow-md group" onClick={() => setStep("connect")}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Globe className="h-6 w-6 text-green-500 group-hover:scale-110 transition-transform" />
                    Conectar a um AD Existente
                  </CardTitle>
                  <CardDescription>
                    Gerenciar um servidor remoto existente (Linux Samba ou Windows Server).
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        )}

        {step === "provision" && (
          <Card className="shadow-2xl">
            <CardHeader>
              <Button variant="ghost" size="icon" className="mb-2" onClick={() => setStep("choice")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle>Provisionar Novo Domínio Samba</CardTitle>
              <CardDescription>Esta ação requer privilégios de root no servidor Linux.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleProvision} className="space-y-4">
                {error && <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">{error}</div>}
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nome do Domínio (ex: empresa.local)</label>
                  <Input required placeholder="empresa.local" value={domainName} onChange={e => setDomainName(e.target.value)} />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Senha do Administrador do Domínio</label>
                  <Input required type="password" placeholder="********" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
                </div>
                
                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Iniciar Provisionamento"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

        {step === "connect" && (
          <Card className="shadow-2xl">
            <CardHeader>
              <Button variant="ghost" size="icon" className="mb-2" onClick={() => setStep("choice")}>
                <ArrowLeft className="h-4 w-4" />
              </Button>
              <CardTitle>Conectar a AD Existente</CardTitle>
              <CardDescription>Informe as credenciais LDAP/RPC do servidor remoto.</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConnect} className="space-y-4">
                {error && <div className="p-3 text-sm bg-destructive/10 text-destructive rounded-md">{error}</div>}
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Endereço IP / Hostname</label>
                    <Input required placeholder="192.168.0.10" value={serverIp} onChange={e => setServerIp(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Domínio (Opcional)</label>
                    <Input placeholder="empresa.local" value={domainName} onChange={e => setDomainName(e.target.value)} />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Usuário (Administrator)</label>
                  <Input required placeholder="Administrator" value={adminUser} onChange={e => setAdminUser(e.target.value)} />
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Senha</label>
                  <Input required type="password" placeholder="********" value={adminPassword} onChange={e => setAdminPassword(e.target.value)} />
                </div>
                
                <Button type="submit" className="w-full mt-4" disabled={loading}>
                  {loading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Testar e Conectar"}
                </Button>
              </form>
            </CardContent>
          </Card>
        )}

      </div>
    </div>
  );
}
