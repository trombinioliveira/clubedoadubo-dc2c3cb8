import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { Search, Shield, Filter, MessageCircle, Mail, Eye, X } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  whatsapp: string | null;
  whatsapp_connected: boolean | null;
  referral_code: string | null;
  auth_provider: string | null;
  account_status: string | null;
  created_at: string;
  last_login_at: string | null;
}

interface UserRole {
  user_id: string;
  role: 'admin' | 'staff' | 'client';
}

type FilterType = 'all' | 'email' | 'google' | 'apple';
type WhatsAppFilter = 'all' | 'connected' | 'not_connected';
type StatusFilter = 'all' | 'active' | 'inactive' | 'blocked';

export function UsersManagement() {
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [userRoles, setUserRoles] = useState<Record<string, string[]>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddRoleOpen, setIsAddRoleOpen] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [newRole, setNewRole] = useState<'admin' | 'staff' | 'client'>('client');
  const [selectedProfile, setSelectedProfile] = useState<Profile | null>(null);
  
  // Filters
  const [authProviderFilter, setAuthProviderFilter] = useState<FilterType>('all');
  const [whatsappFilter, setWhatsappFilter] = useState<WhatsAppFilter>('all');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    setIsLoading(true);
    
    const { data: profilesData, error: profilesError } = await supabase
      .from('profiles')
      .select('id, user_id, full_name, email, whatsapp, whatsapp_connected, referral_code, auth_provider, account_status, created_at, last_login_at')
      .order('created_at', { ascending: false });

    if (profilesError) {
      toast.error('Erro ao carregar usuários');
      console.error(profilesError);
      setIsLoading(false);
      return;
    }

    const { data: rolesData, error: rolesError } = await supabase
      .from('user_roles')
      .select('user_id, role');

    if (rolesError) {
      toast.error('Erro ao carregar funções');
      console.error(rolesError);
    }

    // Group roles by user_id
    const rolesMap: Record<string, string[]> = {};
    rolesData?.forEach((r: UserRole) => {
      if (!rolesMap[r.user_id]) {
        rolesMap[r.user_id] = [];
      }
      rolesMap[r.user_id].push(r.role);
    });

    setProfiles(profilesData as Profile[] || []);
    setUserRoles(rolesMap);
    setIsLoading(false);
  };

  const addRole = async () => {
    if (!selectedUserId) return;

    const { error } = await supabase
      .from('user_roles')
      .insert({ user_id: selectedUserId, role: newRole });

    if (error) {
      if (error.code === '23505') {
        toast.error('Este usuário já possui esta função');
      } else {
        toast.error('Erro ao adicionar função');
      }
      return;
    }

    toast.success('Função adicionada com sucesso!');
    setIsAddRoleOpen(false);
    fetchUsers();
  };

  // Apply all filters
  const filteredProfiles = profiles.filter(p => {
    // Search filter
    const matchesSearch = 
      p.full_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.referral_code && p.referral_code.toLowerCase().includes(searchTerm.toLowerCase()));
    
    // Auth provider filter
    const matchesAuthProvider = 
      authProviderFilter === 'all' || 
      p.auth_provider === authProviderFilter;
    
    // WhatsApp filter
    const matchesWhatsApp = 
      whatsappFilter === 'all' ||
      (whatsappFilter === 'connected' && p.whatsapp_connected) ||
      (whatsappFilter === 'not_connected' && !p.whatsapp_connected);
    
    // Status filter
    const matchesStatus = 
      statusFilter === 'all' ||
      p.account_status === statusFilter;
    
    return matchesSearch && matchesAuthProvider && matchesWhatsApp && matchesStatus;
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'staff': return 'secondary';
      default: return 'outline';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Admin';
      case 'staff': return 'Staff';
      default: return 'Cliente';
    }
  };

  const getAuthProviderLabel = (provider: string | null) => {
    switch (provider) {
      case 'google': return 'Google';
      case 'apple': return 'Apple';
      case 'email': return 'Email';
      default: return 'Email';
    }
  };

  const getStatusBadge = (status: string | null) => {
    switch (status) {
      case 'active':
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Ativo</Badge>;
      case 'inactive':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-600 border-yellow-500/20">Inativo</Badge>;
      case 'blocked':
        return <Badge variant="destructive">Bloqueado</Badge>;
      default:
        return <Badge variant="outline" className="bg-green-500/10 text-green-600 border-green-500/20">Ativo</Badge>;
    }
  };

  const clearFilters = () => {
    setAuthProviderFilter('all');
    setWhatsappFilter('all');
    setStatusFilter('all');
    setSearchTerm('');
  };

  const hasActiveFilters = authProviderFilter !== 'all' || whatsappFilter !== 'all' || statusFilter !== 'all';

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Gerenciar Usuários</CardTitle>
        <Badge variant="secondary">{filteredProfiles.length} usuários</Badge>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="space-y-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Buscar por nome, email ou código único..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Button 
              variant={showFilters ? "secondary" : "outline"} 
              size="sm"
              onClick={() => setShowFilters(!showFilters)}
              className="gap-2"
            >
              <Filter className="w-4 h-4" />
              Filtros
              {hasActiveFilters && (
                <Badge variant="destructive" className="ml-1 h-5 w-5 p-0 flex items-center justify-center text-xs">
                  !
                </Badge>
              )}
            </Button>
          </div>

          {/* Filter Panel */}
          {showFilters && (
            <div className="flex flex-wrap items-center gap-4 p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Login</Label>
                <Select value={authProviderFilter} onValueChange={(v) => setAuthProviderFilter(v as FilterType)}>
                  <SelectTrigger className="w-[130px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="email">Email</SelectItem>
                    <SelectItem value="google">Google</SelectItem>
                    <SelectItem value="apple">Apple</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">WhatsApp</Label>
                <Select value={whatsappFilter} onValueChange={(v) => setWhatsappFilter(v as WhatsAppFilter)}>
                  <SelectTrigger className="w-[150px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="connected">Conectado</SelectItem>
                    <SelectItem value="not_connected">Não conectado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-xs text-muted-foreground">Status</Label>
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as StatusFilter)}>
                  <SelectTrigger className="w-[130px] h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                    <SelectItem value="blocked">Bloqueado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {hasActiveFilters && (
                <Button variant="ghost" size="sm" onClick={clearFilters} className="mt-5">
                  <X className="w-4 h-4 mr-1" />
                  Limpar
                </Button>
              )}
            </div>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>WhatsApp</TableHead>
                  <TableHead>Login</TableHead>
                  <TableHead>Funções</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cadastro</TableHead>
                  <TableHead>Último Login</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProfiles.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={10} className="text-center py-8 text-muted-foreground">
                      Nenhum usuário encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredProfiles.map((profile) => (
                    <TableRow key={profile.id}>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-xs font-mono">
                          {profile.referral_code || '-'}
                        </code>
                      </TableCell>
                      <TableCell className="font-medium">{profile.full_name}</TableCell>
                      <TableCell className="text-sm">{profile.email}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {profile.whatsapp ? (
                            <>
                              <span className="text-sm">{profile.whatsapp}</span>
                              {profile.whatsapp_connected && (
                                <MessageCircle className="w-3 h-3 text-green-500" />
                              )}
                            </>
                          ) : (
                            <span className="text-muted-foreground text-sm">-</span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          {getAuthProviderLabel(profile.auth_provider)}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1 flex-wrap">
                          {(userRoles[profile.user_id] || ['client']).map((role) => (
                            <Badge key={role} variant={getRoleBadgeVariant(role)} className="text-xs">
                              {getRoleLabel(role)}
                            </Badge>
                          ))}
                        </div>
                      </TableCell>
                      <TableCell>
                        {getStatusBadge(profile.account_status)}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {format(new Date(profile.created_at), "dd/MM/yyyy", { locale: ptBR })}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {profile.last_login_at 
                          ? format(new Date(profile.last_login_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                          : '-'}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-1">
                          {/* View Details */}
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setSelectedProfile(profile)}
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-md">
                              <DialogHeader>
                                <DialogTitle>Detalhes do Usuário</DialogTitle>
                              </DialogHeader>
                              {selectedProfile && (
                                <div className="space-y-4 pt-4">
                                  <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                      <Label className="text-muted-foreground">Código Único</Label>
                                      <p className="font-mono font-medium">{selectedProfile.referral_code || '-'}</p>
                                    </div>
                                    <div>
                                      <Label className="text-muted-foreground">Status</Label>
                                      <p>{getStatusBadge(selectedProfile.account_status)}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <Label className="text-muted-foreground">Nome Completo</Label>
                                      <p className="font-medium">{selectedProfile.full_name}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <Label className="text-muted-foreground">Email</Label>
                                      <p>{selectedProfile.email}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <Label className="text-muted-foreground">WhatsApp</Label>
                                      <div className="flex items-center gap-2">
                                        <p>{selectedProfile.whatsapp || 'Não informado'}</p>
                                        {selectedProfile.whatsapp_connected && (
                                          <Badge variant="outline" className="bg-green-500/10 text-green-600 text-xs">
                                            Conectado
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-muted-foreground">Método de Login</Label>
                                      <p>{getAuthProviderLabel(selectedProfile.auth_provider)}</p>
                                    </div>
                                    <div>
                                      <Label className="text-muted-foreground">Funções</Label>
                                      <div className="flex gap-1 flex-wrap mt-1">
                                        {(userRoles[selectedProfile.user_id] || ['client']).map((role) => (
                                          <Badge key={role} variant={getRoleBadgeVariant(role)} className="text-xs">
                                            {getRoleLabel(role)}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                    <div>
                                      <Label className="text-muted-foreground">Cadastro</Label>
                                      <p>{format(new Date(selectedProfile.created_at), "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                                    </div>
                                    <div>
                                      <Label className="text-muted-foreground">Último Login</Label>
                                      <p>
                                        {selectedProfile.last_login_at 
                                          ? format(new Date(selectedProfile.last_login_at), "dd/MM/yyyy HH:mm", { locale: ptBR })
                                          : 'Nunca'}
                                      </p>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>

                          {/* Add Role */}
                          <Dialog open={isAddRoleOpen && selectedUserId === profile.user_id} onOpenChange={(open) => {
                            setIsAddRoleOpen(open);
                            if (open) setSelectedUserId(profile.user_id);
                          }}>
                            <DialogTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <Shield className="w-4 h-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent>
                              <DialogHeader>
                                <DialogTitle>Adicionar Função</DialogTitle>
                              </DialogHeader>
                              <div className="space-y-4 pt-4">
                                <div className="space-y-2">
                                  <Label>Usuário</Label>
                                  <p className="text-sm text-muted-foreground">{profile.full_name}</p>
                                </div>
                                <div className="space-y-2">
                                  <Label>Função</Label>
                                  <Select value={newRole} onValueChange={(v) => setNewRole(v as typeof newRole)}>
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="client">Cliente</SelectItem>
                                      <SelectItem value="staff">Staff</SelectItem>
                                      <SelectItem value="admin">Admin</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <Button onClick={addRole} className="w-full">
                                  Adicionar Função
                                </Button>
                              </div>
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
