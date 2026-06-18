/** Formato relativo "hace N dias/horas" en espanol, a partir de una fecha ISO. */
export function timeAgo(iso: string, now: Date = new Date()): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return iso;
  const mins = Math.round((now.getTime() - then) / 60000);
  if (mins < 1) return 'recién';
  if (mins < 60) return `hace ${mins} min`;
  const hours = Math.round(mins / 60);
  if (hours < 24) return `hace ${hours} h`;
  const days = Math.round(hours / 24);
  if (days < 30) return `hace ${days} d`;
  const months = Math.round(days / 30);
  if (months < 12) return `hace ${months} mes${months > 1 ? 'es' : ''}`;
  return `hace ${Math.round(months / 12)} a`;
}

/** Fecha legible corta: 2026-06-10 -> 10 jun 2026. */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' });
}
