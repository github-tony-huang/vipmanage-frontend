/**
 * 格式化时间：ISO 8601 → 本地可读格式
 * "2026-08-13T12:08:53.86Z" → "2026-08-13 12:08:53"
 * 已格式化的字符串原样返回
 */
export function formatTime(time: string | undefined | null): string {
  if (!time) return '-';
  if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}/.test(time)) return time;
  const d = new Date(time);
  if (isNaN(d.getTime())) return time;
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
}

/**
 * 实时计算期限卡的剩余天数
 * 基于 expire_date 和当前时间的差值，向上取整
 * 过期返回 0
 */
export function calcRemainDays(expireDate: string | undefined | null): number {
  if (!expireDate) return 0;
  const expire = new Date(expireDate);
  if (isNaN(expire.getTime())) return 0;
  const now = new Date();
  const diff = expire.getTime() - now.getTime();
  if (diff <= 0) return 0;
  return Math.ceil(diff / (1000 * 60 * 60 * 24));
}
