export const toJsDate = (value) => {
  if (!value) return null;
  if (value instanceof Date) return value;
  if (typeof value?.toDate === 'function') return value.toDate();
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
};

export const formatRelativeTime = (date, now = new Date()) => {
  const value = toJsDate(date);
  if (!value) return '';

  const seconds = Math.round((now.getTime() - value.getTime()) / 1000);
  if (seconds < 5) return 'now';
  if (seconds < 60) return `${seconds}s ago`;

  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}min ago`;

  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}hr ago`;

  const days = Math.round(hours / 24);
  if (days < 14) return `${days}day${days === 1 ? '' : 's'} ago`;

  const weeks = Math.round(days / 7);
  if (weeks < 8) return `${weeks}week${weeks === 1 ? '' : 's'} ago`;

  const months = Math.round(days / 30);
  if (months < 12) return `${months}month${months === 1 ? '' : 's'} ago`;

  const years = Math.round(days / 365);
  return `${years}yr${years === 1 ? '' : 's'} ago`;
};

