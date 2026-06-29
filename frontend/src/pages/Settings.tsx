import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Settings, Loader2, Shield, Network, Save, CheckCircle2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { getSettings, updateSettings } from "@/api/axios";

export function SettingsPage() {
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState<any>(null);
  const [success, setSuccess] = useState(false);

  const { data: settings, isLoading } = useQuery({
    queryKey: ['settings'],
    queryFn: getSettings,
  });

  // Inicializa o state local quando os dados carregam
  React.useEffect(() => {
    if (settings && !formData) {
      setFormData(settings);
    }
  }, [settings, formData]);

  const mutation = useMutation({
    mutationFn: updateSettings,
    onSuccess: (data) => {
      queryClient.setQueryData(['settings'], data);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    },
  });

  const handleSave = () => {
    if (formData) {
      mutation.mutate(formData);
    }
  };

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [field]: value }));
  };

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Configurações Globais</h2>
          <p className="text-muted-foreground">
            Políticas de domínio, segurança e parâmetros do servidor.
          </p>
        </div>
        <div className="flex items-center gap-3">
          {success && <span className="text-sm text-green-500 flex items-center"><CheckCircle2 className="mr-1 h-4 w-4" /> Salvo</span>}
          <Button onClick={handleSave} disabled={mutation.isPending || isLoading}>
            {mutation.isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
            Salvar Alterações
          </Button>
        </div>
      </div>

      {isLoading || !formData ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          
          {/* Domínio */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Network className="h-5 w-5" />
                Domínio e Floresta
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Nome do Domínio (FQDN)</label>
                <Input value={formData.domain_name} disabled />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Nível Funcional</label>
                <Input value={formData.functional_level} disabled />
              </div>
            </CardContent>
          </Card>

          {/* Políticas de Senha */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Políticas de Senha (GPO)
              </CardTitle>
              <CardDescription>Regras aplicadas a todos os usuários do Samba AD.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-3 border rounded-md">
                <div className="space-y-0.5">
                  <label className="text-sm font-medium">Exigir Complexidade</label>
                  <p className="text-xs text-muted-foreground">Senhas devem conter números e símbolos.</p>
                </div>
                <input 
                  type="checkbox" 
                  className="accent-primary h-4 w-4 cursor-pointer" 
                  checked={formData.password_complexity} 
                  onChange={(e) => handleChange('password_complexity', e.target.checked)}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tamanho Mínimo</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={formData.min_password_length} 
                      className="w-20"
                      onChange={(e) => handleChange('min_password_length', Number(e.target.value))}
                    />
                    <span className="text-xs text-muted-foreground">caracteres</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Expiração (Max Age)</label>
                  <div className="flex items-center gap-2">
                    <Input 
                      type="number" 
                      value={formData.max_password_age} 
                      className="w-20" 
                      onChange={(e) => handleChange('max_password_age', Number(e.target.value))}
                    />
                    <span className="text-xs text-muted-foreground">dias</span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Histórico de Senhas</label>
                <div className="flex items-center gap-2">
                  <Input 
                    type="number" 
                    value={formData.password_history} 
                    className="w-20"
                    onChange={(e) => handleChange('password_history', Number(e.target.value))}
                  />
                  <span className="text-xs text-muted-foreground">senhas lembradas</span>
                </div>
              </div>
            </CardContent>
          </Card>

        </div>
      )}
    </div>
  );
}
