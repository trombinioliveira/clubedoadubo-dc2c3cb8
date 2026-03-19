import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Pencil, Trash2, GripVertical, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

interface Mission {
  id: string;
  title: string;
  description: string;
  emoji: string;
  type: string;
  reward_pros: number;
  is_active: boolean;
  sort_order: number;
}

const typeLabels: Record<string, string> = {
  habit: 'Hábito Diário',
  impact: 'Impacto Ambiental',
  expansion: 'Expansão',
  special: 'Especial',
};

const typeColors: Record<string, string> = {
  habit: 'bg-amber-500/10 text-amber-700 border-amber-500/30',
  impact: 'bg-emerald-500/10 text-emerald-700 border-emerald-500/30',
  expansion: 'bg-blue-500/10 text-blue-700 border-blue-500/30',
  special: 'bg-purple-500/10 text-purple-700 border-purple-500/30',
};

const emptyMission = {
  title: '',
  description: '',
  emoji: '🌱',
  type: 'habit',
  reward_pros: 1,
  is_active: true,
  sort_order: 0,
};

export function SiteManagement() {
  const queryClient = useQueryClient();
  const [editingMission, setEditingMission] = useState<Partial<Mission> | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // ─ Generic setting fetcher ─
  const useSetting = (key: string, defaultVal = true) => useQuery({
    queryKey: ['site-settings', key],
    queryFn: async () => {
      const { data, error } = await supabase.from('site_settings').select('value').eq('key', key).single();
      if (error) return defaultVal;
      const value = data?.value;
      const enabled = value && typeof value === 'object' && 'enabled' in value ? (value as { enabled?: boolean }).enabled : undefined;
      return enabled ?? defaultVal;
    },
  });

  const useToggleSetting = (key: string) => useMutation({
    mutationFn: async (enabled: boolean) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase.from('site_settings')
        .update({ value: { enabled }, updated_by: user?.id })
        .eq('key', key);
      if (error) throw error;
    },
    onSuccess: () => { queryClient.invalidateQueries({ queryKey: ['site-settings'] }); toast.success('Módulo atualizado'); },
  });

  const { data: missionsEnabled, isLoading: settingsLoading } = useSetting('missions_enabled');
  const { data: collectiveImpactEnabled, isLoading: collectiveLoading } = useSetting('collective_impact_enabled');
  const { data: pubTransparency } = useSetting('public_transparency_enabled');
  const { data: pubFifo } = useSetting('public_fifo_enabled');
  const { data: pubSales } = useSetting('public_sales_enabled');
  const { data: pubPoints } = useSetting('public_collection_points_enabled');
  const { data: pubKpis } = useSetting('public_kpis_enabled');

  const toggleMissions = useToggleSetting('missions_enabled');
  const toggleCollective = useToggleSetting('collective_impact_enabled');
  const togglePubTransparency = useToggleSetting('public_transparency_enabled');
  const togglePubFifo = useToggleSetting('public_fifo_enabled');
  const togglePubSales = useToggleSetting('public_sales_enabled');
  const togglePubPoints = useToggleSetting('public_collection_points_enabled');
  const togglePubKpis = useToggleSetting('public_kpis_enabled');

  // Missions query
  const { data: missions = [], isLoading: missionsLoading } = useQuery({
    queryKey: ['admin-missions'],
    queryFn: async () => {
      const { data, error } = await supabase.from('impact_missions').select('*').order('sort_order');
      if (error) throw error;
      return (data ?? []) as Mission[];
    },
  });

  const toggleModule = useMutation({
    mutationFn: async (enabled: boolean) => {
      const { data: { user } } = await supabase.auth.getUser();
      const { error } = await supabase
        .from('site_settings')
        .update({ value: { enabled }, updated_by: user?.id })
        .eq('key', 'missions_enabled');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['site-settings'] });
      toast.success('Módulo atualizado');
    },
  });

  // Save mission (create or update)
  const saveMission = useMutation({
    mutationFn: async (mission: Partial<Mission>) => {
      if (mission.id) {
        const { error } = await supabase
          .from('impact_missions')
          .update({
            title: mission.title!,
            description: mission.description!,
            emoji: mission.emoji!,
            type: mission.type!,
            reward_pros: mission.reward_pros!,
            is_active: mission.is_active!,
            sort_order: mission.sort_order!,
          })
          .eq('id', mission.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('impact_missions')
          .insert({
            title: mission.title!,
            description: mission.description!,
            emoji: mission.emoji!,
            type: mission.type!,
            reward_pros: mission.reward_pros!,
            is_active: mission.is_active ?? true,
            sort_order: mission.sort_order ?? missions.length + 1,
          });
        if (error) throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-missions'] });
      setDialogOpen(false);
      setEditingMission(null);
      toast.success('Missão salva');
    },
    onError: () => toast.error('Erro ao salvar missão'),
  });

  // Delete mission
  const deleteMission = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('impact_missions').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-missions'] });
      toast.success('Missão removida');
    },
  });

  // Toggle individual mission active
  const toggleMission = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('impact_missions').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-missions'] }),
  });

  const openCreate = () => {
    setEditingMission({ ...emptyMission, sort_order: missions.length + 1 });
    setDialogOpen(true);
  };

  const openEdit = (m: Mission) => {
    setEditingMission({ ...m });
    setDialogOpen(true);
  };

  const isLoading = settingsLoading || missionsLoading;

  return (
    <div className="space-y-6">
      {/* Help text */}
      <div className="p-3 rounded-lg bg-muted/50 border text-sm text-muted-foreground flex items-start gap-2">
        <span className="font-bold">ℹ️</span>
        <span>
          <strong>Site</strong> — Controla módulos visíveis na área logada, no painel público de transparência, missões e o modo do ambiente (sandbox/production).
        </span>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Módulos da Área Logada</CardTitle>
          <CardDescription>
            Ative ou desative módulos visíveis na área logada dos usuários.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Missões de Impacto</Label>
              <p className="text-sm text-muted-foreground">
                {missionsEnabled ? 'Missões e Diário de Impacto visíveis' : 'Missões e Diário ocultos para todos'}
              </p>
            </div>
            <Switch
              checked={!!missionsEnabled}
              onCheckedChange={(checked) => toggleModule.mutate(checked)}
              disabled={settingsLoading || toggleModule.isPending}
            />
          </div>
          <div className="border-t pt-4 flex items-center justify-between">
            <div>
              <Label className="text-base font-medium">Impacto Ambiental Coletivo</Label>
              <p className="text-sm text-muted-foreground">
                {collectiveImpactEnabled ? 'Card de impacto coletivo visível na área logada' : 'Card de impacto coletivo oculto para todos'}
              </p>
            </div>
            <Switch
              checked={!!collectiveImpactEnabled}
              onCheckedChange={(checked) => toggleCollective.mutate(checked)}
              disabled={collectiveLoading || toggleCollective.isPending}
            />
          </div>
        </CardContent>
      </Card>

      {/* Public Panel Toggles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Painel Público de Transparência</CardTitle>
          <CardDescription>Controle o que é visível em /painel-publico para visitantes anônimos.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {[
            { key: 'public_transparency_enabled', label: 'Painel Público (geral)', desc: 'Habilita ou desabilita o painel completo', data: pubTransparency, toggle: togglePubTransparency },
            { key: 'public_kpis_enabled', label: 'KPIs Públicos', desc: 'Indicadores do ciclo (PROs, kg, vendas)', data: pubKpis, toggle: togglePubKpis },
            { key: 'public_fifo_enabled', label: 'Fila Pública do Ciclo', desc: 'Tabela paginada da fila pública', data: pubFifo, toggle: togglePubFifo },
            { key: 'public_sales_enabled', label: 'Vendas Públicas', desc: 'Listagem de entradas financeiras públicas', data: pubSales, toggle: togglePubSales },
            { key: 'public_collection_points_enabled', label: 'Pontos de Coleta', desc: 'Lista de pontos ativos no painel', data: pubPoints, toggle: togglePubPoints },
          ].map(({ key, label, desc, data, toggle }) => (
            <div key={key} className="flex items-center justify-between border-b pb-4 last:border-0 last:pb-0">
              <div>
                <Label className="text-base font-medium">{label}</Label>
                <p className="text-sm text-muted-foreground">{data ? desc + ' — ativo' : desc + ' — desativado'}</p>
              </div>
              <Switch
                checked={!!data}
                onCheckedChange={(checked) => toggle.mutate(checked)}
                disabled={toggle.isPending}
              />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Missions list */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Missões Cadastradas</CardTitle>
            <CardDescription>{missions.length} missão(ões)</CardDescription>
          </div>
          <Button onClick={openCreate} size="sm">
            <Plus className="w-4 h-4 mr-2" /> Nova Missão
          </Button>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Missão</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead className="text-center">PROs</TableHead>
                  <TableHead className="text-center">Ativa</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {missions.map((m) => (
                  <TableRow key={m.id}>
                    <TableCell className="text-muted-foreground">{m.sort_order}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span className="text-xl">{m.emoji}</span>
                        <div>
                          <p className="font-medium text-sm">{m.title}</p>
                          <p className="text-xs text-muted-foreground">{m.description}</p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className={typeColors[m.type]}>
                        {typeLabels[m.type] || m.type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-center font-mono">+{m.reward_pros}</TableCell>
                    <TableCell className="text-center">
                      <Switch
                        checked={m.is_active}
                        onCheckedChange={(checked) => toggleMission.mutate({ id: m.id, is_active: checked })}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" onClick={() => openEdit(m)}>
                          <Pencil className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="text-destructive"
                          onClick={() => {
                            if (confirm('Remover esta missão?')) deleteMission.mutate(m.id);
                          }}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Create / Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editingMission?.id ? 'Editar Missão' : 'Nova Missão'}</DialogTitle>
          </DialogHeader>
          {editingMission && (
            <div className="space-y-4">
              <div className="grid grid-cols-[80px_1fr] gap-4">
                <div>
                  <Label>Emoji</Label>
                  <Input
                    value={editingMission.emoji || ''}
                    onChange={(e) => setEditingMission({ ...editingMission, emoji: e.target.value })}
                    className="text-center text-2xl"
                  />
                </div>
                <div>
                  <Label>Título</Label>
                  <Input
                    value={editingMission.title || ''}
                    onChange={(e) => setEditingMission({ ...editingMission, title: e.target.value })}
                    placeholder="Nome da missão"
                  />
                </div>
              </div>
              <div>
                <Label>Descrição</Label>
                <Input
                  value={editingMission.description || ''}
                  onChange={(e) => setEditingMission({ ...editingMission, description: e.target.value })}
                  placeholder="Breve descrição"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Tipo</Label>
                  <Select
                    value={editingMission.type || 'habit'}
                    onValueChange={(v) => setEditingMission({ ...editingMission, type: v })}
                  >
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="habit">Hábito Diário</SelectItem>
                      <SelectItem value="impact">Impacto Ambiental</SelectItem>
                      <SelectItem value="expansion">Expansão</SelectItem>
                      <SelectItem value="special">Especial</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Recompensa (PROs)</Label>
                  <Input
                    type="number"
                    min={1}
                    value={editingMission.reward_pros || 1}
                    onChange={(e) => setEditingMission({ ...editingMission, reward_pros: parseInt(e.target.value) || 1 })}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ordem</Label>
                  <Input
                    type="number"
                    min={0}
                    value={editingMission.sort_order || 0}
                    onChange={(e) => setEditingMission({ ...editingMission, sort_order: parseInt(e.target.value) || 0 })}
                  />
                </div>
                <div className="flex items-end gap-2 pb-1">
                  <Switch
                    checked={editingMission.is_active ?? true}
                    onCheckedChange={(checked) => setEditingMission({ ...editingMission, is_active: checked })}
                  />
                  <Label>Ativa</Label>
                </div>
              </div>
              <Button
                className="w-full"
                onClick={() => saveMission.mutate(editingMission)}
                disabled={!editingMission.title || !editingMission.description || saveMission.isPending}
              >
                {saveMission.isPending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                {editingMission.id ? 'Salvar Alterações' : 'Criar Missão'}
              </Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
