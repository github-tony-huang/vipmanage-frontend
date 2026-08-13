/**
 * 格式化时间：ISO 8601 → 本地可读格式
 * "2026-08-13T12:08:53.86Z" → "2026-08-13 12:08:53"
 * 已格式化的字符串原样返回
 */
export function formatTime(time: string | undefined | null): string {
  if (!time) return '-';
  // 已经是 yyyy-MM-dd HH:mm:ss 格式，直接返回
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(time)) return time;
  const d = new Date(time);
  if (isNaN(d.getTime())) return time;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}
