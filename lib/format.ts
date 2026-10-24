const numberFormatter = new Intl.NumberFormat("en-US");

export function formatNumber(value: number) {
  return numberFormatter.format(Math.round(value));
}

export function formatHoursMinutes(minutes: number) {
  const safe = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safe / 60);
  const rest = safe % 60;
  if (hours === 0) return `${rest}m`;
  if (rest === 0) return `${formatNumber(hours)}h`;
  return `${formatNumber(hours)}h ${rest}m`;
}

export function formatCompactHours(minutes: number) {
  const hours = Math.max(0, minutes) / 60;
  if (hours >= 100) return `${formatNumber(hours)}h`;
  if (hours >= 10) return `${hours.toFixed(0)}h`;
  return `${hours.toFixed(1)}h`;
}

export function formatDays(minutes: number) {
  const days = Math.max(0, minutes) / 1440;
  return `${days.toFixed(days >= 10 ? 1 : 2)} days`;
}

export function formatRuntime(minutes: number | null | undefined) {
  if (!minutes) return null;
  return formatHoursMinutes(minutes);
}

export function formatDate(date: Date | string) {
  const value = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
}

export function formatShortDate(date: Date | string) {
  const value = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    timeZone: "UTC",
  }).format(value);
}

export function formatMonth(date: Date | string) {
  const value = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
}

export function formatYear(date: Date | string | null | undefined) {
  if (!date) return null;
  const value = typeof date === "string" ? new Date(date) : date;
  if (Number.isNaN(value.getTime())) return null;
  return String(value.getUTCFullYear());
}

export function formatRating(rating: number | null | undefined) {
  if (rating === null || rating === undefined) return null;
  return rating.toFixed(1).replace(/\.0$/, "");
}

export function pluralize(count: number, singular: string, plural = `${singular}s`) {
  return count === 1 ? singular : plural;
}
