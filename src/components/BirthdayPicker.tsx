import { useMemo } from 'react';

interface BirthdayPickerProps {
  value: string; // "2000-01-15" 格式
  onChange: (val: string) => void;
  className?: string;
}

export default function BirthdayPicker({ value, onChange, className = '' }: BirthdayPickerProps) {
  // 解析当前值
  const [year, month, day] = useMemo(() => {
    if (!value) return ['', '', ''];
    const parts = value.split('-');
    return [parts[0] || '', parts[1] || '', parts[2] || ''];
  }, [value]);

  const years = useMemo(() => {
    const arr: number[] = [];
    for (let y = 2020; y >= 1940; y--) arr.push(y);
    return arr;
  }, []);

  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []);

  const days = useMemo(() => {
    if (!year || !month) return Array.from({ length: 31 }, (_, i) => i + 1);
    const d = new Date(Number(year), Number(month), 0).getDate();
    return Array.from({ length: d }, (_, i) => i + 1);
  }, [year, month]);

  const update = (y: string, m: string, d: string) => {
    if (y && m && d) {
      onChange(`${y}-${m.padStart(2, '0')}-${d.padStart(2, '0')}`);
    } else {
      onChange('');
    }
  };

  const selectCls = 'input flex-1 text-center';

  return (
    <div className={`flex gap-2 ${className}`}>
      <select value={year} onChange={(e) => update(e.target.value, month, day)} className={selectCls}>
        <option value="">年</option>
        {years.map((y) => <option key={y} value={y}>{y}</option>)}
      </select>
      <select value={month} onChange={(e) => update(year, e.target.value, day)} className={selectCls}>
        <option value="">月</option>
        {months.map((m) => <option key={m} value={m}>{m}</option>)}
      </select>
      <select value={day} onChange={(e) => update(year, month, e.target.value)} className={selectCls}>
        <option value="">日</option>
        {days.map((d) => <option key={d} value={d}>{d}</option>)}
      </select>
    </div>
  );
}
