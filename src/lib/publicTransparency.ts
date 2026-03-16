import { supabase } from '@/integrations/supabase/client';

// ─── Types ──────────────────────────────────────────────────────────────────

export interface PublicKPIs {
  totalPros: number;
  pendingPros: number;
  paidPros: number;
  totalWeightGrams: number;
  totalWeighings: number;
  weightCollectedGrams: number;
  totalSales: number;
  totalSalesAmount: number;
  totalDistributed: number;
  activeCollectionPoints: number;
  lastSale: { received_at: string; amount: number; description: string } | null;
  lastBatch: { code: string; ready_date: string; total_weight_grams: number; status: string } | null;
  batchesProcessing: number;
  weightProcessingGrams: number;
  batchesDone: number;
  weightDoneGrams: number;
}

export interface PublicFifoEntry {
  queue_id: string;
  position: number;
  status: string;
  created_at: string;
  paid_at: string | null;
  pro_code: string;
  weight_grams: number;
}

export interface PublicSaleEntry {
  id: string;
  received_at: string;
  amount: number;
  currency: string;
  status: string;
  provider: string;
  product_key: string | null;
  description: string | null;
  is_distributed: boolean;
  pros_paid: number | null;
  distributed_at: string | null;
}

export interface PublicDistributionEntry {
  id: string;
  gross_amount: number;
  amount_to_fifo: number;
  amount_to_operations: number;
  pros_paid_count: number;
  fifo_positions_advanced: number;
  created_at: string;
  sale_received_at: string | null;
  sale_description: string | null;
}

export interface PublicCollectionPoint {
  id: string;
  name: string;
  city: string;
  state: string;
  address: string;
  opening_hours: string | null;
  phone: string | null;
  whatsapp: string | null;
  slug: string | null;
  has_public_page: boolean;
  description: string | null;
}

export interface TransparencySettings {
  public_transparency_enabled: boolean;
  public_fifo_enabled: boolean;
  public_sales_enabled: boolean;
  public_collection_points_enabled: boolean;
  public_kpis_enabled: boolean;
}

// ─── Service Functions ───────────────────────────────────────────────────────

export async function fetchPublicKPIs(): Promise<PublicKPIs> {
  const { data, error } = await supabase.rpc('get_public_transparency_kpis');
  if (error) throw error;
  return data as unknown as PublicKPIs;
}

export async function fetchPublicFifo(
  page = 0,
  pageSize = 50,
  searchCode = '',
  limitTo200 = true,
  statusFilter?: string
): Promise<{ data: PublicFifoEntry[]; count: number }> {
  const maxRows = limitTo200 ? 200 : 5000;
  let query = supabase
    .from('public_fifo_queue')
    .select('*', { count: 'exact' })
    .order('position', { ascending: true })
    .range(page * pageSize, Math.min(page * pageSize + pageSize - 1, maxRows - 1));

  if (searchCode) {
    query = query.ilike('pro_code', `%${searchCode}%`);
  }
  if (statusFilter) {
    query = query.eq('status', statusFilter);
  }

  const { data, error, count } = await query;
  if (error) throw error;
  return { data: (data || []) as PublicFifoEntry[], count: count || 0 };
}

export async function fetchPublicSales(limit = 10): Promise<PublicSaleEntry[]> {
  const { data, error } = await supabase
    .from('public_financial_entries')
    .select('*')
    .eq('status', 'confirmed')
    .order('received_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as PublicSaleEntry[];
}

export async function fetchPublicCollectionPoints(): Promise<PublicCollectionPoint[]> {
  const { data, error } = await supabase
    .from('public_collection_points_list')
    .select('*')
    .order('name', { ascending: true });
  if (error) throw error;
  return (data || []) as PublicCollectionPoint[];
}

export async function fetchSiteSettingsPublic(): Promise<TransparencySettings> {
  const keys = [
    'public_transparency_enabled',
    'public_fifo_enabled',
    'public_sales_enabled',
    'public_collection_points_enabled',
    'public_kpis_enabled',
  ];
  const { data, error } = await supabase
    .from('site_settings')
    .select('key, value')
    .in('key', keys);

  const defaults: TransparencySettings = {
    public_transparency_enabled: true,
    public_fifo_enabled: true,
    public_sales_enabled: true,
    public_collection_points_enabled: true,
    public_kpis_enabled: true,
  };

  if (error || !data) return defaults;

  const result = { ...defaults };
  for (const row of data) {
    const val = (row.value as any)?.enabled ?? true;
    (result as any)[row.key] = val;
  }
  return result;
}

export async function fetchMonthlyReport() {
  const startOfMonth = new Date();
  startOfMonth.setDate(1);
  startOfMonth.setHours(0, 0, 0, 0);
  const isoStart = startOfMonth.toISOString();

  const [salesRes, weighingsRes, prosRes] = await Promise.all([
    supabase
      .from('public_financial_entries')
      .select('amount, pros_paid')
      .eq('status', 'confirmed')
      .gte('received_at', isoStart),
    supabase
      .from('weighings')
      .select('weight_grams')
      .gte('weighed_at', isoStart),
    supabase
      .from('pros')
      .select('status, weight_grams')
      .gte('created_at', isoStart),
  ]);

  const salesAmount = (salesRes.data || []).reduce((s, r) => s + (r.amount || 0), 0);
  const prosPaid = (salesRes.data || []).reduce((s, r) => s + (r.pros_paid || 0), 0);
  const kgCollected = (weighingsRes.data || []).reduce((s, r) => s + (r.weight_grams || 0), 0) / 1000;
  const prosEmitted = (prosRes.data || []).length;
  const kgProcessed = (prosRes.data || []).reduce((s, r) => s + (r.weight_grams || 0), 0) / 1000;

  return { salesAmount, prosPaid, kgCollected, kgProcessed, prosEmitted };
}

export interface CycleStageCounts {
  coleta: number;
  processamento: number;
  producao: number;
  venda: number;
  pago: number;
}

export interface CycleStageDetail {
  counts: CycleStageCounts;
  total: number;
  samples: Record<keyof CycleStageCounts, string[]>;
}

const STATUS_TO_STAGE: Record<string, keyof CycleStageCounts> = {
  pending: 'coleta',
  processing: 'processamento',
  ready: 'producao',
  sold: 'venda',
  paid: 'pago',
};

export async function fetchCycleStagesDetail(): Promise<CycleStageDetail> {
  const statuses = ['pending', 'processing', 'ready', 'sold', 'paid'] as const;

  // Parallel: count per status + 3 sample codes per status
  const results = await Promise.all(
    statuses.flatMap((st) => [
      supabase
        .from('public_fifo_queue')
        .select('queue_id', { count: 'exact', head: true })
        .eq('status', st),
      supabase
        .from('public_fifo_queue')
        .select('pro_code')
        .eq('status', st)
        .order('position', { ascending: true })
        .limit(3),
    ])
  );

  const counts: CycleStageCounts = { coleta: 0, processamento: 0, producao: 0, venda: 0, pago: 0 };
  const samples: Record<keyof CycleStageCounts, string[]> = {
    coleta: [], processamento: [], producao: [], venda: [], pago: [],
  };

  statuses.forEach((st, i) => {
    const stage = STATUS_TO_STAGE[st];
    const countRes = results[i * 2];
    const sampleRes = results[i * 2 + 1];
    counts[stage] = countRes.count ?? 0;
    samples[stage] = (sampleRes.data || []).map((r: any) => r.pro_code as string);
  });

  const total = Object.values(counts).reduce((a, b) => a + b, 0);
  return { counts, total, samples };
}

export async function fetchPublicDistributions(limit = 6): Promise<PublicDistributionEntry[]> {
  const { data, error } = await (supabase as any)
    .from('public_sale_distributions')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error) throw error;
  return (data || []) as PublicDistributionEntry[];
}

// ─── Checkout helper (calls create-mp-preference edge function) ──────────────

export interface MPPreferenceResult {
  init_point: string;
  preference_id: string;
  external_reference: string;
}

export async function createMPPreference(params: {
  product_key: string;
  quantity: number;
  user_id?: string | null;
  referral_code?: string | null;
  collection_point_slug?: string | null;
}): Promise<MPPreferenceResult> {
  const { data, error } = await supabase.functions.invoke('create-mp-preference', {
    body: params,
  });
  if (error) {
    if (data?.error === 'ADDRESS_INCOMPLETE') {
      throw new Error('ADDRESS_INCOMPLETE');
    }
    throw error;
  }
  if (data?.error === 'ADDRESS_INCOMPLETE') {
    throw new Error('ADDRESS_INCOMPLETE');
  }
  return data as MPPreferenceResult;
}
