import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Users, Shield, Server, Activity, Loader2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getDashboardStats } from "@/api/axios";

export function Dashboard() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex h-[50vh] items-center justify-center text-destructive">
        <p>Erro ao carregar dados do dashboard. Verifique se a API está rodando.</p>
      </div>
    );
  }

  const stats = [
    { title: "Total de Usuários", value: data?.total_users || 0, icon: Users, color: "text-blue-500" },
    { title: "Grupos Ativos", value: data?.total_groups || 0, icon: Shield, color: "text-purple-500" },
    { title: "Computadores", value: data?.total_computers || 0, icon: Server, color: "text-amber-500" },
    { title: "Uso de CPU", value: `${data?.cpu_usage || 0}%`, icon: Activity, color: "text-green-500" },
  ];

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
        <p className="text-muted-foreground">
          Visão geral do domínio Samba Active Directory.
        </p>
      </div>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <Icon className={`h-4 w-4 ${stat.color}`} />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Últimos Eventos</CardTitle>
            <CardDescription>Auditoria recente do diretório</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-2 h-2 rounded-full bg-primary" />
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">Usuário "j.doe" autenticado</p>
                    <p className="text-xs text-muted-foreground">Há {i * 5} minutos - IP: 192.168.1.100</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
        
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Status do Sistema</CardTitle>
            <CardDescription>Serviços principais</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
               <div className="flex items-center justify-between">
                 <span className="text-sm font-medium">Samba AD DC</span>
                 <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-md">Ativo</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm font-medium">DNS (Bind9)</span>
                 <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-md">Ativo</span>
               </div>
               <div className="flex items-center justify-between">
                 <span className="text-sm font-medium">Kerberos</span>
                 <span className="text-xs px-2 py-1 bg-green-500/10 text-green-500 rounded-md">Ativo</span>
               </div>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
