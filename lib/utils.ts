export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function dateKey(date: Date) {
  return date.toISOString().slice(0, 10);
}

export function monthKey(date: Date) {
  return date.toISOString().slice(0, 7);
}

export function initials(value: string) {
  return value
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

export function safeParseDate(value: string | null | undefined) {
  if (!value) return null;
  const date = new Date(value.length === 10 ? `${value}T12:00:00.000Z` : value);
  return Number.isNaN(date.getTime()) ? null : date;
}
