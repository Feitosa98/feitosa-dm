import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Monitor, Loader2, MonitorOff, MonitorCheck } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getComputers } from "@/api/axios";

export function Computers() {
  const { data: computers, isLoading } = useQuery({
    queryKey: ['computers'],
    queryFn: getComputers,
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Inventário de Computadores</h2>
        <p className="text-muted-foreground">
          Visualização das máquinas atreladas ao domínio.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Computadores do Domínio
          </CardTitle>
          <CardDescription>
            Lista de estações de trabalho e servidores registrados no AD.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex h-32 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <div className="rounded-md border">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground">
                  <tr>
                    <th className="px-4 py-3 font-medium">Nome da Máquina</th>
                    <th className="px-4 py-3 font-medium">Sistema Operacional</th>
                    <th className="px-4 py-3 font-medium">Endereço IP</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium">OU (Unidade)</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {computers?.map((comp: any) => (
                    <tr key={comp.name} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{comp.name}</td>
                      <td className="px-4 py-3">{comp.os}</td>
                      <td className="px-4 py-3">{comp.ip}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium ${
                          comp.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-muted text-muted-foreground'
                        }`}>
                          {comp.status === 'active' ? <MonitorCheck className="h-3 w-3" /> : <MonitorOff className="h-3 w-3" />}
                          {comp.status === 'active' ? 'Online' : 'Offline'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{comp.ou}</td>
                    </tr>
                  ))}
                  {computers?.length === 0 && (
                     <tr>
                       <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                         Nenhum computador encontrado.
                       </td>
                     </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
