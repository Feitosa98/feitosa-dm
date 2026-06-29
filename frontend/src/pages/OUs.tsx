import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Server, Plus, Loader2, MoreHorizontal, FolderTree } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getOUs, createOU } from "@/api/axios";

export function OUs() {
  const queryClient = useQueryClient();
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: "", description: "" });

  const { data: ous, isLoading } = useQuery({
    queryKey: ['ous'],
    queryFn: getOUs,
  });

  const createMutation = useMutation({
    mutationFn: createOU,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['ous'] });
      setIsCreating(false);
      setFormData({ name: "", description: "" });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate(formData);
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Unidades Organizacionais</h2>
          <p className="text-muted-foreground">
            Gerencie as OUs para estruturar seu diretório.
          </p>
        </div>
        <Button onClick={() => setIsCreating(!isCreating)}>
          <Plus className="mr-2 h-4 w-4" /> Nova OU
        </Button>
      </div>

      {isCreating && (
        <Card className="border-primary/50 shadow-md">
          <CardHeader>
            <CardTitle>Criar Nova OU</CardTitle>
            <CardDescription>Defina o nome da Unidade Organizacional.</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4 max-w-md">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome da OU</label>
                <Input 
                  required
                  placeholder="TI" 
                  value={formData.name}
                  onChange={e => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Descrição</label>
                <Input 
                  placeholder="Departamento de Tecnologia" 
                  value={formData.description}
                  onChange={e => setFormData({...formData, description: e.target.value})}
                />
              </div>
              <div className="flex gap-2 pt-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : "Criar OU"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>
                  Cancelar
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FolderTree className="h-5 w-5" />
            Estrutura de OUs
          </CardTitle>
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
                    <th className="px-4 py-3 font-medium">Nome</th>
                    <th className="px-4 py-3 font-medium">Descrição</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {ous?.map((ou: any) => (
                    <tr key={ou.name} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium flex items-center gap-2">
                        <FolderTree className="h-4 w-4 text-primary" /> {ou.name}
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{ou.description}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {ous?.length === 0 && (
                     <tr>
                       <td colSpan={3} className="px-4 py-8 text-center text-muted-foreground">
                         Nenhuma OU encontrada.
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
