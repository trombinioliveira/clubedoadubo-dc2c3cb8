import { supabase } from '@/integrations/supabase/client';

/**
 * Convert array of objects to CSV string with proper escaping
 */
export function arrayToCSV(data: Record<string, unknown>[], columns?: { key: string; label: string }[]): string {
  if (!data.length) return '';

  const keys = columns ? columns.map(c => c.key) : Object.keys(data[0]);
  const headers = columns ? columns.map(c => c.label) : keys;

  const escapeCell = (val: unknown): string => {
    if (val === null || val === undefined) return '';
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const rows = data.map(row => keys.map(k => escapeCell(row[k])).join(','));
  return [headers.map(h => escapeCell(h)).join(','), ...rows].join('\n');
}

/**
 * Download CSV string as file
 */
export function downloadCSV(csv: string, filename: string) {
  const BOM = '\uFEFF'; // UTF-8 BOM for Excel compatibility
  const blob = new Blob([BOM + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to CSV and log the export
 */
export async function exportToCSV(
  data: Record<string, unknown>[],
  filename: string,
  datasetType: string,
  filters: Record<string, unknown> = {},
  columns?: { key: string; label: string }[]
) {
  const csv = arrayToCSV(data, columns);
  downloadCSV(csv, filename);

  // Log the export
  const { data: { user } } = await supabase.auth.getUser();
  if (user) {
    await supabase.from('export_logs').insert([{
      admin_user_id: user.id,
      dataset_type: datasetType,
      filters_applied: filters as unknown as Record<string, unknown>,
      rows_exported: data.length,
    }]);
  }

  return data.length;
}
