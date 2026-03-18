import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Skeleton } from '@/components/ui/skeleton';
import { Search, Link2, Users, Package, ExternalLink } from 'lucide-react';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ProWithUser {
  id: string;
  code: string;
  status: string;
  weight_grams: number;
  created_at: string;
  paid_at: string | null;
  pro_type: string | null;
  user_id: string;
  user_name: string;
  user_email: string;
  referral_code: string | null;
  referred_by_name: string | null;
}

interface ProfileLookup {
  user_id: string;
  full_name: string;
  email: string;
  referral_code: string | null;
  referred_by: string | null;
}
...
      // Create profile map
      const profileMap = new Map<string, ProfileLookup>(profiles?.map((p) => [p.user_id, p as ProfileLookup]) ?? []);

      // Merge data
      return pros.map((pro) => {
        const profile = profileMap.get(pro.user_id);
        return {
          ...pro,
          user_name: profile?.full_name || 'Desconhecido',
          user_email: profile?.email || '',
          referral_code: profile?.referral_code || null,
          referred_by_name: profile?.referred_by ? referrerMap.get(profile.referred_by) || null : null,
        } as ProWithUser;
      });
    },
  });

  const { data: totalCount } = useQuery({
    queryKey: ['admin-pro-count', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('pros')
        .select('id', { count: 'exact', head: true });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter as ProStatus);
      }

      const { count, error } = await query;
      if (error) throw error;
      return count || 0;
    },
  });

  const filteredData = React.useMemo(() => {
    if (!search || !data) return data;
    const searchLower = search.toLowerCase();
    return data.filter(
      p =>
        p.code.toLowerCase().includes(searchLower) ||
        p.user_name.toLowerCase().includes(searchLower) ||
        p.user_email.toLowerCase().includes(searchLower) ||
        p.referral_code?.toLowerCase().includes(searchLower)
    );
  }, [data, search]);

  const totalPages = Math.ceil((totalCount || 0) / pageSize);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Link2 className="w-5 h-5" />
          Auditoria PRO ↔ Usuário
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Buscar por código, nome ou email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={(v) => { setStatusFilter(v as ProStatus | 'all'); setPage(0); }}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os Status</SelectItem>
              <SelectItem value="pending">Pendente</SelectItem>
              <SelectItem value="processing">Processando</SelectItem>
              <SelectItem value="ready">Pronto</SelectItem>
              <SelectItem value="sold">Vendido</SelectItem>
              <SelectItem value="paid">Pago</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats */}
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1">
            <Package className="w-4 h-4" />
            {totalCount?.toLocaleString('pt-BR')} PROs total
          </span>
          <span className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            Página {page + 1} de {totalPages || 1}
          </span>
        </div>

        {/* Table */}
        {isLoading ? (
          <Skeleton className="h-64 w-full" />
        ) : (
          <div className="rounded-md border overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Código PRO</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Código Indicação</TableHead>
                  <TableHead>Indicado por</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Peso</TableHead>
                  <TableHead>Criado em</TableHead>
                  <TableHead>Pago em</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredData?.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                      Nenhum PRO encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredData?.map((pro) => {
                    const statusInfo = statusLabels[pro.status] || statusLabels.pending;
                    return (
                      <TableRow key={pro.id}>
                        <TableCell>
                          <code className="bg-muted px-2 py-1 rounded text-sm font-mono">
                            {pro.code}
                          </code>
                        </TableCell>
                        <TableCell>
                          <div>
                            <div className="font-medium">{pro.user_name}</div>
                            <div className="text-xs text-muted-foreground">{pro.user_email}</div>
                          </div>
                        </TableCell>
                        <TableCell>
                          {pro.referral_code ? (
                            <a 
                              href={`/u/${pro.referral_code}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1 text-secondary hover:underline"
                            >
                              <code className="bg-secondary/20 px-2 py-0.5 rounded text-sm">
                                {pro.referral_code}
                              </code>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          ) : (
                            <span className="text-muted-foreground">—</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {pro.referred_by_name || <span className="text-muted-foreground">—</span>}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {pro.pro_type || 'standard'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={statusInfo.variant}>
                            {statusInfo.label}
                          </Badge>
                        </TableCell>
                        <TableCell>{pro.weight_grams}g</TableCell>
                        <TableCell>
                          {format(new Date(pro.created_at), "dd/MM/yy HH:mm", { locale: ptBR })}
                        </TableCell>
                        <TableCell>
                          {pro.paid_at 
                            ? format(new Date(pro.paid_at), "dd/MM/yy", { locale: ptBR })
                            : <span className="text-muted-foreground">—</span>
                          }
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Pagination */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => Math.max(0, p - 1))}
            disabled={page === 0}
          >
            Anterior
          </Button>
          <span className="text-sm text-muted-foreground">
            Página {page + 1} de {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage(p => p + 1)}
            disabled={page >= totalPages - 1}
          >
            Próxima
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
