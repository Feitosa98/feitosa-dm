import React from "react";
import { useQuery } from "@tanstack/react-query";
import { History, Loader2, ShieldAlert, Key, UserPlus } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { getAuditLogs } from "@/api/axios";

export function Audit() {
  const { data: logs, isLoading } = useQuery({
    queryKey: ['auditLogs'],
    queryFn: getAuditLogs,
  });

  const getActionIcon = (action: string) => {
    if (action.includes("LOGIN_FAILED")) return <ShieldAlert className="h-4 w-4 text-destructive" />;
    if (action.includes("LOGIN_SUCCESS")) return <Key className="h-4 w-4 text-green-500" />;
    if (action.includes("CREATE")) return <UserPlus className="h-4 w-4 text-blue-500" />;
    return <History className="h-4 w-4 text-muted-foreground" />;
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Auditoria e Logs</h2>
        <p className="text-muted-foreground">
          Visualização de eventos para conformidade com o Provimento CNJ nº 213/2025.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Histórico de Eventos
          </CardTitle>
          <CardDescription>
            Logs recentes do servidor Samba AD.
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
                    <th className="px-4 py-3 font-medium">Data/Hora</th>
                    <th className="px-4 py-3 font-medium">Usuário Responsável</th>
                    <th className="px-4 py-3 font-medium">Ação</th>
                    <th className="px-4 py-3 font-medium">Detalhes</th>
                    <th className="px-4 py-3 font-medium">Endereço IP</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {logs?.map((log: any) => (
                    <tr key={log.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs">{log.timestamp}</td>
                      <td className="px-4 py-3 font-medium">{log.user}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          {getActionIcon(log.action)}
                          <span className="font-mono text-xs">{log.action}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{log.details}</td>
                      <td className="px-4 py-3 font-mono text-xs">{log.ip}</td>
                    </tr>
                  ))}
                  {logs?.length === 0 && (
                     <tr>
                       <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                         Nenhum evento registrado.
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
