import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Search } from 'lucide-react';

interface UserReferralData {
  id: string;
  full_name: string;
  email: string;
  referral_code: string | null;
  direct_pros: number;
  recurring_pros: number;
  global_pros_received: number;
  current_level: number;
  commission_earned: number;
}

const levelLabels: Record<number, { label: string; variant: 'default' | 'secondary' | 'outline' }> = {
  1: { label: 'Iniciante', variant: 'outline' },
  2: { label: 'Ativo', variant: 'secondary' },
  3: { label: 'Embaixador', variant: 'default' },
  4: { label: 'Líder', variant: 'default' },
};

export function ReferralsTable() {
  const [search, setSearch] = React.useState('');

  const { data: users, isLoading } = useQuery({
    queryKey: ['admin-referrals-users'],
    queryFn: async () => {
      // Get profiles with referral codes
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('id, user_id, full_name, email, referral_code')
        .not('referral_code', 'is', null)
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get referral stats
      const { data: stats, error: statsError } = await supabase
        .from('referral_stats')
        .select('*');

      if (statsError) throw statsError;

      // Merge data
      const statsMap = new Map(stats?.map(s => [s.user_id, s]));
      
      return profiles?.map(profile => {
        const stat = statsMap.get(profile.user_id);
        return {
          id: profile.id,
          full_name: profile.full_name,
          email: profile.email,
          referral_code: profile.referral_code,
          direct_pros: stat?.direct_pros ?? 0,
          recurring_pros: stat?.recurring_pros ?? 0,
          global_pros_received: stat?.global_pros_received ?? 0,
          current_level: stat?.current_level ?? 1,
          commission_earned: stat?.commission_earned ?? 0,
        } as UserReferralData;
      }) ?? [];
    },
  });

  const filteredUsers = React.useMemo(() => {
    if (!search) return users;
    const searchLower = search.toLowerCase();
    return users?.filter(
      u =>
        u.full_name.toLowerCase().includes(searchLower) ||
        u.email.toLowerCase().includes(searchLower) ||
        u.referral_code?.toLowerCase().includes(searchLower)
    );
  }, [users, search]);

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-10 w-full max-w-sm" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nome, email ou código..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Usuário</TableHead>
              <TableHead>Código</TableHead>
              <TableHead className="text-center">PROs Diretos</TableHead>
              <TableHead className="text-center">PROs Recorrentes</TableHead>
              <TableHead className="text-center">PROs Globais</TableHead>
              <TableHead>Nível</TableHead>
              <TableHead className="text-right">Comissão</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Nenhum usuário encontrado
                </TableCell>
              </TableRow>
            ) : (
              filteredUsers?.map((user) => {
                const levelInfo = levelLabels[user.current_level] || levelLabels[1];
                return (
                  <TableRow key={user.id}>
                    <TableCell>
                      <div>
                        <div className="font-medium">{user.full_name}</div>
                        <div className="text-sm text-muted-foreground">{user.email}</div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <code className="bg-muted px-2 py-1 rounded text-sm">
                        {user.referral_code}
                      </code>
                    </TableCell>
                    <TableCell className="text-center">{user.direct_pros}</TableCell>
                    <TableCell className="text-center">{user.recurring_pros}</TableCell>
                    <TableCell className="text-center">{user.global_pros_received}</TableCell>
                    <TableCell>
                      <Badge variant={levelInfo.variant}>{levelInfo.label}</Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      R$ {user.commission_earned.toFixed(2)}
                    </TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
