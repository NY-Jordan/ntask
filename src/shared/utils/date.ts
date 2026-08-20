export function todayISODate(): string {
  return new Date().toISOString().slice(0, 10);
}

export function isToday(dateISO?: string): boolean {
  if (!dateISO) return true;
  return dateISO.slice(0, 10) === todayISODate();
}

export function isOverdue(dateISO?: string): boolean {
  if (!dateISO) return false;
  return dateISO.slice(0, 10) < todayISODate();
}

export function formatRelativeDate(dateISO: string): string {
  const date = dateISO.slice(0, 10);
  const today = new Date(`${todayISODate()}T00:00:00`);
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (date === todayISODate()) return "Aujourd'hui";
  if (date === tomorrow.toISOString().slice(0, 10)) return 'Demain';
  if (date === yesterday.toISOString().slice(0, 10)) return 'Hier';
  return formatShortDate(dateISO);
}

export function formatShortDate(dateISO: string): string {
  return new Date(`${dateISO.slice(0, 10)}T00:00:00`).toLocaleDateString('fr-FR', {
    day: 'numeric',
    month: 'short',
  });
}

export function formatDateTime(dateISO: string): string {
  const d = new Date(dateISO);
  const date = d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  const time = d.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  return `${date.charAt(0).toUpperCase()}${date.slice(1)} @ ${time}`;
}
