import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Globe, Plus, Loader2, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getDnsZones, getDnsRecords, createDnsRecord, deleteDnsRecord } from "@/api/axios";

export function DNS() {
  const queryClient = useQueryClient();
  const [selectedZone, setSelectedZone] = useState<string>("feitosa.local");
  const [isCreating, setIsCreating] = useState(false);
  const [formData, setFormData] = useState({ name: "", type: "A", data: "" });

  const { data: zones } = useQuery({ queryKey: ['dnsZones'], queryFn: getDnsZones });
  
  const { data: records, isLoading } = useQuery({
    queryKey: ['dnsRecords', selectedZone],
    queryFn: () => getDnsRecords(selectedZone),
  });

  const createMutation = useMutation({
    mutationFn: createDnsRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dnsRecords', selectedZone] });
      setIsCreating(false);
      setFormData({ name: "", type: "A", data: "" });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDnsRecord,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dnsRecords', selectedZone] });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createMutation.mutate({ ...formData, zone: selectedZone });
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Servidor DNS</h2>
          <p className="text-muted-foreground">
            Gerencie as zonas e registros DNS do domínio.
          </p>
        </div>
      </div>

      <div className="flex gap-4 mb-4 overflow-x-auto pb-2">
        {zones?.map((zone: any) => (
          <Button 
            key={zone.name} 
            variant={selectedZone === zone.name ? "default" : "outline"}
            onClick={() => setSelectedZone(zone.name)}
          >
            <Globe className="mr-2 h-4 w-4" />
            {zone.name}
          </Button>
        ))}
      </div>

      {isCreating && (
        <Card className="border-primary/50 shadow-md">
          <CardHeader>
            <CardTitle>Criar Novo Registro ({selectedZone})</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 items-end">
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium">Nome (Host)</label>
                <Input required placeholder="ex: mail" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="space-y-2 w-32">
                <label className="text-sm font-medium">Tipo</label>
                <select 
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={formData.type}
                  onChange={e => setFormData({...formData, type: e.target.value})}
                >
                  <option value="A">A</option>
                  <option value="CNAME">CNAME</option>
                  <option value="MX">MX</option>
                  <option value="TXT">TXT</option>
                </select>
              </div>
              <div className="space-y-2 flex-1">
                <label className="text-sm font-medium">Dados (IP ou Hostname)</label>
                <Input required placeholder="192.168.1.x" value={formData.data} onChange={e => setFormData({...formData, data: e.target.value})} />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : "Salvar"}
                </Button>
                <Button type="button" variant="ghost" onClick={() => setIsCreating(false)}>Cancelar</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">Registros da Zona: {selectedZone}</CardTitle>
          </div>
          <Button onClick={() => setIsCreating(!isCreating)} size="sm">
            <Plus className="mr-2 h-4 w-4" /> Adicionar Registro
          </Button>
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
                    <th className="px-4 py-3 font-medium">Tipo</th>
                    <th className="px-4 py-3 font-medium">Dados</th>
                    <th className="px-4 py-3 font-medium text-right">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {records?.map((record: any) => (
                    <tr key={record.id} className="hover:bg-muted/50 transition-colors">
                      <td className="px-4 py-3 font-medium">{record.name}</td>
                      <td className="px-4 py-3 font-mono text-xs">{record.type}</td>
                      <td className="px-4 py-3 font-mono text-muted-foreground">{record.data}</td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="icon" onClick={() => deleteMutation.mutate(record.id)}>
                          {deleteMutation.isPending && deleteMutation.variables === record.id ? 
                            <Loader2 className="h-4 w-4 animate-spin text-destructive" /> : 
                            <Trash2 className="h-4 w-4 text-destructive hover:text-destructive/80" />
                          }
                        </Button>
                      </td>
                    </tr>
                  ))}
                  {records?.length === 0 && (
                     <tr>
                       <td colSpan={4} className="px-4 py-8 text-center text-muted-foreground">
                         Nenhum registro encontrado nesta zona.
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
