import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Save, Loader2, PlayCircle, CheckCircle2, RefreshCw } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { getBackups, runBackup, restoreBackup } from "@/api/axios";

export function Backup() {
  const queryClient = useQueryClient();

  const { data: backups, isLoading } = useQuery({
    queryKey: ['backups'],
    queryFn: getBackups,
  });

  const runMutation = useMutation({
    mutationFn: runBackup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['backups'] });
    },
  });

  const restoreMutation = useMutation({
    mutationFn: restoreBackup,
    onSuccess: () => {
      alert("Processo de restore finalizado com sucesso!");
    },
  });

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Backup do Domínio</h2>
          <p className="text-muted-foreground">
            Gerencie e execute backups manuais do servidor Samba AD.
          </p>
        </div>
        <Button onClick={() => runMutation.mutate()} disabled={runMutation.isPending}>
          {runMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <PlayCircle className="mr-2 h-4 w-4" />}
          Executar Backup Agora
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            Histórico de Backups
          </CardTitle>
          <CardDescription>
            Lista de snapshots de banco de dados e arquivos de configuração.
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
                    <th className="px-4 py-3 font-medium">Arquivo</th>
                    <th className="px-4 py-3 font-medium">Tamanho</th>
                    <th className="px-4 py-3 font-medium">Data</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {backups?.map((backup: any) => (
                    <tr key={backup.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium flex items-center gap-2">
                        <Save className="h-4 w-4 text-muted-foreground" /> {backup.filename}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{backup.size}</td>
                      <td className="px-4 py-3 font-mono text-xs">{backup.date}</td>
                      <td className="px-4 py-3">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium bg-green-500/10 text-green-500">
                          <CheckCircle2 className="h-3 w-3" />
                          Concluído
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => {
                            if(window.confirm("Deseja realmente restaurar este backup? O servidor ficará indisponível durante a operação.")) {
                              restoreMutation.mutate(backup.id);
                            }
                          }}
                          disabled={restoreMutation.isPending && restoreMutation.variables === backup.id}
                        >
                          {restoreMutation.isPending && restoreMutation.variables === backup.id ? 
                            <Loader2 className="mr-2 h-3 w-3 animate-spin" /> : 
                            <RefreshCw className="mr-2 h-3 w-3" />
                          }
                          Restaurar
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {backups?.length === 0 && (
                     <tr>
                       <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                         Nenhum backup encontrado.
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
