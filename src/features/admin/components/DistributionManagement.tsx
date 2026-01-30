import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/lib/auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Plus, Store, Package, Truck, Edit, Calendar, Phone, MapPin, User, MessageSquare } from 'lucide-react';
import { format, addDays } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface SalesPoint {
  id: string;
  name: string | null;
  address: string | null;
  phone: string | null;
  whatsapp: string | null;
  contact_name: string | null;
  notes: string | null;
  is_active: boolean;
  created_at: string;
}

interface Distribution {
  id: string;
  sales_point_id: string | null;
  granulated_packages: number;
  granulated_kg_per_package: number;
  liquid_bottles: number;
  liquid_liters_per_bottle: number;
  other_items: string | null;
  observations: string | null;
  distributed_at: string;
  check_at: string | null;
  pros_moved: number;
  created_at: string;
  sales_points?: SalesPoint;
}

export function DistributionManagement() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('distributions');
  
  // Sales Points State
  const [salesPoints, setSalesPoints] = useState<SalesPoint[]>([]);
  const [isLoadingSalesPoints, setIsLoadingSalesPoints] = useState(true);
  const [isAddSalesPointOpen, setIsAddSalesPointOpen] = useState(false);
  const [editingSalesPoint, setEditingSalesPoint] = useState<SalesPoint | null>(null);
  const [newSalesPoint, setNewSalesPoint] = useState({
    name: '',
    address: '',
    phone: '',
    whatsapp: '',
    contact_name: '',
    notes: ''
  });

  // Distributions State
  const [distributions, setDistributions] = useState<Distribution[]>([]);
  const [isLoadingDistributions, setIsLoadingDistributions] = useState(true);
  const [isAddDistributionOpen, setIsAddDistributionOpen] = useState(false);
  const [readyProsCount, setReadyProsCount] = useState(0);
  const [newDistribution, setNewDistribution] = useState({
    sales_point_id: '',
    granulated_packages: 0,
    granulated_kg_per_package: 0,
    liquid_bottles: 0,
    liquid_liters_per_bottle: 0,
    other_items: '',
    observations: '',
    check_days: 7
  });

  // Calculate total weight and PROs to move
  const totalGranulatedKg = newDistribution.granulated_packages * newDistribution.granulated_kg_per_package;
  const totalLiquidKg = newDistribution.liquid_bottles * newDistribution.liquid_liters_per_bottle;
  const totalWeightKg = totalGranulatedKg + totalLiquidKg;
  const totalWeightGrams = totalWeightKg * 1000;
  const prosToMove = Math.floor(totalWeightGrams / 100);

  useEffect(() => {
    fetchSalesPoints();
    fetchDistributions();
    fetchReadyProsCount();
  }, []);

  const fetchReadyProsCount = async () => {
    const { count } = await supabase
      .from('pros')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'ready');
    
    setReadyProsCount(count || 0);
  };

  const fetchSalesPoints = async () => {
    setIsLoadingSalesPoints(true);
    const { data, error } = await supabase
      .from('sales_points')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar pontos de venda');
      console.error(error);
    } else {
      setSalesPoints(data || []);
    }
    setIsLoadingSalesPoints(false);
  };

  const fetchDistributions = async () => {
    setIsLoadingDistributions(true);
    const { data, error } = await supabase
      .from('distributions')
      .select(`
        *,
        sales_points (*)
      `)
      .order('distributed_at', { ascending: false });

    if (error) {
      toast.error('Erro ao carregar distribuições');
      console.error(error);
    } else {
      setDistributions(data || []);
    }
    setIsLoadingDistributions(false);
  };

  // Sales Point CRUD
  const saveSalesPoint = async () => {
    const data = {
      name: newSalesPoint.name || null,
      address: newSalesPoint.address || null,
      phone: newSalesPoint.phone || null,
      whatsapp: newSalesPoint.whatsapp || null,
      contact_name: newSalesPoint.contact_name || null,
      notes: newSalesPoint.notes || null,
      created_by: user?.id
    };

    if (editingSalesPoint) {
      const { error } = await supabase
        .from('sales_points')
        .update(data)
        .eq('id', editingSalesPoint.id);

      if (error) {
        toast.error('Erro ao atualizar ponto de venda');
        console.error(error);
        return;
      }
      toast.success('Ponto de venda atualizado!');
    } else {
      const { error } = await supabase
        .from('sales_points')
        .insert(data);

      if (error) {
        toast.error('Erro ao criar ponto de venda');
        console.error(error);
        return;
      }
      toast.success('Ponto de venda criado!');
    }

    setIsAddSalesPointOpen(false);
    setEditingSalesPoint(null);
    setNewSalesPoint({ name: '', address: '', phone: '', whatsapp: '', contact_name: '', notes: '' });
    fetchSalesPoints();
  };

  const openEditSalesPoint = (sp: SalesPoint) => {
    setEditingSalesPoint(sp);
    setNewSalesPoint({
      name: sp.name || '',
      address: sp.address || '',
      phone: sp.phone || '',
      whatsapp: sp.whatsapp || '',
      contact_name: sp.contact_name || '',
      notes: sp.notes || ''
    });
    setIsAddSalesPointOpen(true);
  };

  // Distribution CRUD
  const createDistribution = async () => {
    if (prosToMove === 0) {
      toast.error('É necessário informar quantidade de produtos para distribuir');
      return;
    }

    if (prosToMove > readyProsCount) {
      toast.error(`Não há PROs suficientes em Produção. Disponíveis: ${readyProsCount}, Necessários: ${prosToMove}`);
      return;
    }

    const checkAt = addDays(new Date(), newDistribution.check_days);

    // Create the distribution record
    const { data: distData, error: distError } = await supabase
      .from('distributions')
      .insert({
        sales_point_id: newDistribution.sales_point_id || null,
        granulated_packages: newDistribution.granulated_packages,
        granulated_kg_per_package: newDistribution.granulated_kg_per_package,
        liquid_bottles: newDistribution.liquid_bottles,
        liquid_liters_per_bottle: newDistribution.liquid_liters_per_bottle,
        other_items: newDistribution.other_items || null,
        observations: newDistribution.observations || null,
        check_at: checkAt.toISOString(),
        pros_moved: prosToMove,
        created_by: user?.id
      })
      .select('id')
      .single();

    if (distError) {
      toast.error('Erro ao criar distribuição');
      console.error(distError);
      return;
    }

    // Get PROs to move from 'ready' to 'sold' (FIFO order)
    const { data: prosToUpdate, error: prosSelectError } = await supabase
      .from('pros')
      .select('id')
      .eq('status', 'ready')
      .order('fifo_position', { ascending: true })
      .limit(prosToMove);

    if (prosSelectError || !prosToUpdate) {
      toast.error('Erro ao buscar PROs para atualizar');
      console.error(prosSelectError);
      return;
    }

    const proIds = prosToUpdate.map(p => p.id);
    const now = new Date().toISOString();

    // Update PROs status to 'sold'
    const { error: prosUpdateError } = await supabase
      .from('pros')
      .update({ 
        status: 'sold',
        sold_at: now
      })
      .in('id', proIds);

    if (prosUpdateError) {
      toast.error('Erro ao atualizar status dos PROs');
      console.error(prosUpdateError);
      return;
    }

    // Update FIFO queue status
    const { error: fifoError } = await supabase
      .from('fifo_queue')
      .update({ status: 'sold' })
      .in('pro_id', proIds);

    if (fifoError) {
      console.error('Erro ao atualizar fila FIFO:', fifoError);
    }

    toast.success(`Distribuição registrada! ${prosToMove} PROs movidos para Venda.`);
    setIsAddDistributionOpen(false);
    setNewDistribution({
      sales_point_id: '',
      granulated_packages: 0,
      granulated_kg_per_package: 0,
      liquid_bottles: 0,
      liquid_liters_per_bottle: 0,
      other_items: '',
      observations: '',
      check_days: 7
    });
    fetchDistributions();
    fetchReadyProsCount();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Distribuição
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="distributions" className="flex items-center gap-2">
              <Package className="w-4 h-4" />
              Distribuições
            </TabsTrigger>
            <TabsTrigger value="sales-points" className="flex items-center gap-2">
              <Store className="w-4 h-4" />
              Pontos de Venda
            </TabsTrigger>
          </TabsList>

          {/* Distributions Tab */}
          <TabsContent value="distributions">
            <div className="flex justify-end mb-4">
              <Dialog open={isAddDistributionOpen} onOpenChange={setIsAddDistributionOpen}>
                <DialogTrigger asChild>
                  <Button className="earth-gradient">
                    <Plus className="w-4 h-4 mr-2" />
                    Nova Distribuição
                  </Button>
                </DialogTrigger>
                <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Registrar Distribuição</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    {/* Sales Point Selection */}
                    <div className="space-y-2">
                      <Label>Ponto de Venda (opcional)</Label>
                      <Select
                        value={newDistribution.sales_point_id}
                        onValueChange={(v) => setNewDistribution({ ...newDistribution, sales_point_id: v })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um ponto de venda" />
                        </SelectTrigger>
                        <SelectContent>
                          {salesPoints.map((sp) => (
                            <SelectItem key={sp.id} value={sp.id}>
                              {sp.name || sp.contact_name || 'Sem nome'} 
                              {sp.address && ` - ${sp.address}`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Granulated */}
                    <div className="border rounded-lg p-3 space-y-2">
                      <Label className="font-semibold">🌾 Adubo Granulado</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Qtd. Pacotes</Label>
                          <Input
                            type="number"
                            min="0"
                            value={newDistribution.granulated_packages || ''}
                            onChange={(e) => setNewDistribution({ 
                              ...newDistribution, 
                              granulated_packages: parseInt(e.target.value) || 0 
                            })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Kg por Pacote</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            value={newDistribution.granulated_kg_per_package || ''}
                            onChange={(e) => setNewDistribution({ 
                              ...newDistribution, 
                              granulated_kg_per_package: parseFloat(e.target.value) || 0 
                            })}
                          />
                        </div>
                      </div>
                      {totalGranulatedKg > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Total: {totalGranulatedKg.toFixed(1)} Kg
                        </p>
                      )}
                    </div>

                    {/* Liquid */}
                    <div className="border rounded-lg p-3 space-y-2">
                      <Label className="font-semibold">💧 Adubo Líquido</Label>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Qtd. Garrafas</Label>
                          <Input
                            type="number"
                            min="0"
                            value={newDistribution.liquid_bottles || ''}
                            onChange={(e) => setNewDistribution({ 
                              ...newDistribution, 
                              liquid_bottles: parseInt(e.target.value) || 0 
                            })}
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">L por Garrafa</Label>
                          <Input
                            type="number"
                            min="0"
                            step="0.1"
                            value={newDistribution.liquid_liters_per_bottle || ''}
                            onChange={(e) => setNewDistribution({ 
                              ...newDistribution, 
                              liquid_liters_per_bottle: parseFloat(e.target.value) || 0 
                            })}
                          />
                        </div>
                      </div>
                      {totalLiquidKg > 0 && (
                        <p className="text-xs text-muted-foreground">
                          Total: {totalLiquidKg.toFixed(1)} L (≈ Kg)
                        </p>
                      )}
                    </div>

                    {/* Other Items */}
                    <div className="space-y-2">
                      <Label>Outros Itens (baldes, expositores, etc)</Label>
                      <Input
                        placeholder="Ex: 2 baldes de 20L, 1 expositor"
                        value={newDistribution.other_items}
                        onChange={(e) => setNewDistribution({ ...newDistribution, other_items: e.target.value })}
                      />
                    </div>

                    {/* Observations */}
                    <div className="space-y-2">
                      <Label>Observações</Label>
                      <Textarea
                        placeholder="Observações adicionais..."
                        value={newDistribution.observations}
                        onChange={(e) => setNewDistribution({ ...newDistribution, observations: e.target.value })}
                      />
                    </div>

                    {/* Check in X days */}
                    <div className="space-y-2">
                      <Label>Verificar em (dias)</Label>
                      <Input
                        type="number"
                        min="1"
                        value={newDistribution.check_days}
                        onChange={(e) => setNewDistribution({ 
                          ...newDistribution, 
                          check_days: parseInt(e.target.value) || 7 
                        })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Data de verificação: {format(addDays(new Date(), newDistribution.check_days), "dd/MM/yyyy", { locale: ptBR })}
                      </p>
                    </div>

                    {/* Summary */}
                    <div className="bg-muted p-3 rounded-lg space-y-1">
                      <div className="flex justify-between text-sm">
                        <span>Peso Total:</span>
                        <span className="font-medium">{totalWeightKg.toFixed(1)} Kg</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span>PROs a mover para Venda:</span>
                        <span className="font-medium">{prosToMove}</span>
                      </div>
                      <div className="flex justify-between text-sm text-muted-foreground">
                        <span>PROs em Produção disponíveis:</span>
                        <span>{readyProsCount}</span>
                      </div>
                    </div>

                    {prosToMove > readyProsCount && readyProsCount > 0 && (
                      <p className="text-sm text-destructive">
                        Não há PROs suficientes em produção.
                      </p>
                    )}

                    <Button 
                      onClick={createDistribution} 
                      className="w-full"
                      disabled={prosToMove > readyProsCount || prosToMove === 0}
                    >
                      Registrar Distribuição
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {isLoadingDistributions ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data</TableHead>
                      <TableHead>Ponto de Venda</TableHead>
                      <TableHead>Produtos</TableHead>
                      <TableHead>PROs</TableHead>
                      <TableHead>Verificar em</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {distributions.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          <Truck className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          Nenhuma distribuição registrada
                        </TableCell>
                      </TableRow>
                    ) : (
                      distributions.map((dist) => (
                        <TableRow key={dist.id}>
                          <TableCell>
                            {format(new Date(dist.distributed_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}
                          </TableCell>
                          <TableCell>
                            {dist.sales_points?.name || dist.sales_points?.contact_name || '-'}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs space-y-0.5">
                              {dist.granulated_packages > 0 && (
                                <p>🌾 {dist.granulated_packages}x {dist.granulated_kg_per_package}Kg</p>
                              )}
                              {dist.liquid_bottles > 0 && (
                                <p>💧 {dist.liquid_bottles}x {dist.liquid_liters_per_bottle}L</p>
                              )}
                              {dist.other_items && <p>📦 {dist.other_items}</p>}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="secondary">{dist.pros_moved}</Badge>
                          </TableCell>
                          <TableCell>
                            {dist.check_at ? (
                              <div className="flex items-center gap-1 text-xs">
                                <Calendar className="w-3 h-3" />
                                {format(new Date(dist.check_at), "dd/MM/yyyy", { locale: ptBR })}
                              </div>
                            ) : '-'}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>

          {/* Sales Points Tab */}
          <TabsContent value="sales-points">
            <div className="flex justify-end mb-4">
              <Dialog open={isAddSalesPointOpen} onOpenChange={(open) => {
                setIsAddSalesPointOpen(open);
                if (!open) {
                  setEditingSalesPoint(null);
                  setNewSalesPoint({ name: '', address: '', phone: '', whatsapp: '', contact_name: '', notes: '' });
                }
              }}>
                <DialogTrigger asChild>
                  <Button className="earth-gradient">
                    <Plus className="w-4 h-4 mr-2" />
                    Novo Ponto de Venda
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>
                      {editingSalesPoint ? 'Editar Ponto de Venda' : 'Cadastrar Ponto de Venda'}
                    </DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 pt-4">
                    <div className="space-y-2">
                      <Label>Nome do Ponto</Label>
                      <Input
                        placeholder="Ex: Hortifruti da Praça"
                        value={newSalesPoint.name}
                        onChange={(e) => setNewSalesPoint({ ...newSalesPoint, name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Endereço</Label>
                      <Input
                        placeholder="Rua, número, bairro, cidade"
                        value={newSalesPoint.address}
                        onChange={(e) => setNewSalesPoint({ ...newSalesPoint, address: e.target.value })}
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="space-y-2">
                        <Label>Telefone</Label>
                        <Input
                          placeholder="(11) 1234-5678"
                          value={newSalesPoint.phone}
                          onChange={(e) => setNewSalesPoint({ ...newSalesPoint, phone: e.target.value })}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>WhatsApp</Label>
                        <Input
                          placeholder="(11) 91234-5678"
                          value={newSalesPoint.whatsapp}
                          onChange={(e) => setNewSalesPoint({ ...newSalesPoint, whatsapp: e.target.value })}
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <Label>Nome do Contato</Label>
                      <Input
                        placeholder="Nome da pessoa responsável"
                        value={newSalesPoint.contact_name}
                        onChange={(e) => setNewSalesPoint({ ...newSalesPoint, contact_name: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Observações</Label>
                      <Textarea
                        placeholder="Informações adicionais..."
                        value={newSalesPoint.notes}
                        onChange={(e) => setNewSalesPoint({ ...newSalesPoint, notes: e.target.value })}
                      />
                    </div>
                    <Button onClick={saveSalesPoint} className="w-full">
                      {editingSalesPoint ? 'Atualizar' : 'Cadastrar'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            {isLoadingSalesPoints ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Nome</TableHead>
                      <TableHead>Endereço</TableHead>
                      <TableHead>Contato</TableHead>
                      <TableHead>Telefone/WhatsApp</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {salesPoints.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                          <Store className="w-12 h-12 mx-auto mb-2 opacity-50" />
                          Nenhum ponto de venda cadastrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      salesPoints.map((sp) => (
                        <TableRow key={sp.id}>
                          <TableCell className="font-medium">{sp.name || '-'}</TableCell>
                          <TableCell>
                            {sp.address ? (
                              <div className="flex items-center gap-1 text-xs">
                                <MapPin className="w-3 h-3" />
                                {sp.address}
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            {sp.contact_name ? (
                              <div className="flex items-center gap-1 text-xs">
                                <User className="w-3 h-3" />
                                {sp.contact_name}
                              </div>
                            ) : '-'}
                          </TableCell>
                          <TableCell>
                            <div className="text-xs space-y-0.5">
                              {sp.phone && (
                                <div className="flex items-center gap-1">
                                  <Phone className="w-3 h-3" />
                                  {sp.phone}
                                </div>
                              )}
                              {sp.whatsapp && (
                                <div className="flex items-center gap-1">
                                  <MessageSquare className="w-3 h-3" />
                                  {sp.whatsapp}
                                </div>
                              )}
                            </div>
                          </TableCell>
                          <TableCell>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditSalesPoint(sp)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
