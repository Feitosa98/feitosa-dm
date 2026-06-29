import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { HardDrive, Loader2, ShieldAlert, Users, Plus, Folder, ArrowLeft, Settings2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getShares, getShareAcl, createShare } from "@/api/axios";

export function Shares() {
  const queryClient = useQueryClient();
  const [selectedShare, setSelectedShare] = useState<any>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: "", path: "", comment: "" });

  const { data: shares, isLoading: isLoadingShares } = useQuery({
    queryKey: ['shares'],
    queryFn: getShares,
  });

  const createMutation = useMutation({
    mutationFn: createShare,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['shares'] });
      setIsCreating(false);
      setFormData({ name: "", path: "", comment: "" });
    },
  });

  const handleCreateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Compartilhamentos</h2>
        <p className="text-muted-foreground">
          Gerenciamento de pastas de rede e Controle de Acesso (ACL).
        </p>
      </div>

      {!selectedShare ? (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <HardDrive className="h-5 w-5" />
                Pastas Mapeadas
              </CardTitle>
            </div>
            <Button size="sm" onClick={() => setIsCreating(!isCreating)}>
              <Plus className="mr-2 h-4 w-4" /> Novo Compartilhamento
            </Button>
          </CardHeader>
          <CardContent>
            {isCreating && (
              <div className="mb-6 p-4 border rounded-md bg-muted/20 animate-in fade-in slide-in-from-top-2">
                <h3 className="font-semibold mb-4">Adicionar Nova Pasta</h3>
                <form onSubmit={handleCreateSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
                  <div className="space-y-2 flex-1">
                    <label className="text-sm font-medium">Nome do Compartilhamento</label>
                    <Input required placeholder="ex: Projetos" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2 flex-1">
                    <label className="text-sm font-medium">Caminho (Path)</label>
                    <Input required placeholder="/srv/samba/projetos" value={formData.path} onChange={e => setFormData({...formData, path: e.target.value})} />
                  </div>
                  <div className="space-y-2 flex-1">
                    <label className="text-sm font-medium">Comentário</label>
                    <Input placeholder="Pasta geral de projetos..." value={formData.comment} onChange={e => setFormData({...formData, comment: e.target.value})} />
                  </div>
                  <div className="flex gap-2">
                    <Button type="submit" disabled={createMutation.isPending}>
                      {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Criar"}
                    </Button>
                    <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancelar</Button>
                  </div>
                </form>
              </div>
            )}

            {isLoadingShares ? (
              <div className="flex h-32 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {shares?.map((share: any) => (
                  <Card key={share.id} className="cursor-pointer hover:border-primary/50 transition-all shadow-sm">
                    <CardHeader className="pb-2" onClick={() => setSelectedShare(share)}>
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Folder className="h-5 w-5 text-blue-500" />
                        {share.name}
                      </CardTitle>
                      <CardDescription className="font-mono text-xs truncate" title={share.path}>
                        {share.path}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground mb-4">{share.comment}</p>
                      <div className="flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 rounded-full px-2 py-1 text-xs font-medium bg-green-500/10 text-green-500">
                          Ativo
                        </span>
                        <Button variant="ghost" size="sm" className="h-8" onClick={() => setSelectedShare(share)}>
                          <Settings2 className="mr-2 h-3 w-3" /> ACL
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ) : (
        <ShareAclView share={selectedShare} onBack={() => setSelectedShare(null)} />
      )}
    </div>
  );
}

function ShareAclView({ share, onBack }: { share: any, onBack: () => void }) {
  const { data: acl, isLoading } = useQuery({
    queryKey: ['shareAcl', share.id],
    queryFn: () => getShareAcl(share.id),
  });

  return (
    <Card className="border-primary/20 shadow-md animate-in slide-in-from-right-8 duration-300">
      <CardHeader className="bg-muted/30 border-b">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={onBack}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <CardTitle className="text-xl flex items-center gap-2">
              <ShieldAlert className="h-5 w-5 text-primary" />
              Permissões Avançadas (ACL) - {share.name}
            </CardTitle>
            <CardDescription>{share.path}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-sm font-semibold">Entidades com Acesso</h3>
          <Button size="sm" variant="outline">Adicionar Usuário/Grupo</Button>
        </div>
        
        {isLoading ? (
          <div className="flex h-32 items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : (
          <div className="rounded-md border">
            <table className="w-full text-sm text-left">
              <thead className="bg-muted/50 text-muted-foreground">
                <tr>
                  <th className="px-4 py-3 font-medium">Entidade (Usuário/Grupo)</th>
                  <th className="px-4 py-3 font-medium text-center">Controle Total</th>
                  <th className="px-4 py-3 font-medium text-center">Modificar</th>
                  <th className="px-4 py-3 font-medium text-center">Ler & Executar</th>
                  <th className="px-4 py-3 font-medium text-center">Somente Leitura</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {acl?.map((entry: any, i: number) => {
                  const isFull = entry.permission === "Full Control";
                  const isMod = isFull || entry.permission === "Read/Write";
                  const isReadEx = isMod || entry.permission === "Read Only";
                  
                  return (
                    <tr key={i} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        {entry.entity}
                        <span className="text-[10px] uppercase bg-primary/10 text-primary px-1.5 py-0.5 rounded ml-2">
                          {entry.type}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input type="checkbox" className="accent-primary" checked={isFull} readOnly />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input type="checkbox" className="accent-primary" checked={isMod} readOnly />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input type="checkbox" className="accent-primary" checked={isReadEx} readOnly />
                      </td>
                      <td className="px-4 py-3 text-center">
                        <input type="checkbox" className="accent-primary" checked={isReadEx} readOnly />
                      </td>
                    </tr>
                  )
                })}
                {acl?.length === 0 && (
                   <tr>
                     <td colSpan={5} className="px-4 py-8 text-center text-muted-foreground">
                       Nenhuma permissão configurada.
                     </td>
                   </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
