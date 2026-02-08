import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Search, Users, Clock, Leaf } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import type { ReferredUser } from '../hooks/useReferralData';

interface ReferredUsersListProps {
  users: ReferredUser[];
  isLoading: boolean;
}

export function ReferredUsersList({ users, isLoading }: ReferredUsersListProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeTab, setActiveTab] = useState('all');

  const filteredUsers = users.filter(user => {
    const matchesSearch = user.fullName.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (activeTab === 'all') return matchesSearch;
    if (activeTab === 'active') return matchesSearch && user.isActive;
    if (activeTab === 'pending') return matchesSearch && !user.isActive;
    return matchesSearch;
  });

  const activeCount = users.filter(u => u.isActive).length;
  const pendingCount = users.filter(u => !u.isActive).length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-secondary border-t-transparent rounded-full mx-auto" />
          <p className="text-muted-foreground mt-2">Carregando...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Users className="w-5 h-5 text-secondary" />
            Minha Rede de Impacto
          </CardTitle>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por nome..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 w-full sm:w-64"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-full grid grid-cols-3 mb-4">
            <TabsTrigger value="all" className="text-xs">
              Todos ({users.length})
            </TabsTrigger>
            <TabsTrigger value="active" className="text-xs">
              Ativos ({activeCount})
            </TabsTrigger>
            <TabsTrigger value="pending" className="text-xs">
              Pendentes ({pendingCount})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="mt-0">
            <div className="space-y-3 max-h-[500px] overflow-y-auto">
              {filteredUsers.length === 0 ? (
                <div className="text-center py-12 bg-muted/30 rounded-xl">
                  <Users className="w-12 h-12 mx-auto text-muted-foreground mb-3" />
                  <p className="text-muted-foreground">
                    {searchTerm ? 'Nenhum resultado encontrado' : 'Nenhum indicado ainda'}
                  </p>
                  {!searchTerm && users.length === 0 && (
                    <p className="text-sm text-muted-foreground mt-1">
                      Compartilhe seu link e comece sua onda de impacto!
                    </p>
                  )}
                </div>
              ) : (
                filteredUsers.map((user) => (
                  <div 
                    key={user.id}
                    className="p-4 bg-muted/30 rounded-xl border border-border hover:border-secondary/50 transition-colors"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary font-bold">
                          {user.fullName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-medium text-foreground">{user.fullName}</p>
                          <p className="text-xs text-muted-foreground">
                            Entrou em {format(new Date(user.joinedAt), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                        </div>
                      </div>
                      <Badge variant={user.isActive ? 'default' : 'secondary'}>
                        {user.isActive ? 'Ativo' : 'Pendente'}
                      </Badge>
                    </div>

                    <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
                      <div className="p-2 bg-background rounded-lg text-center">
                        <p className="font-medium text-primary">{user.prosCount}</p>
                        <p className="text-muted-foreground text-xs">PROs</p>
                      </div>
                      <div className="p-2 bg-background rounded-lg text-center">
                        <p className="font-medium">{(user.totalWeightGrams / 1000).toFixed(1)} kg</p>
                        <p className="text-muted-foreground text-xs">Resíduo</p>
                      </div>
                      <div className="p-2 bg-background rounded-lg text-center">
                        <p className="font-medium text-emerald-600">{user.paidPros}</p>
                        <p className="text-muted-foreground text-xs">Pagos</p>
                      </div>
                    </div>

                    {user.lastActivity && (
                      <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground">
                        <Clock className="w-3 h-3" />
                        Última atividade: {format(new Date(user.lastActivity), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
