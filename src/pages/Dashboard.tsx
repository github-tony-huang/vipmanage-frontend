import { useState, useEffect } from 'react';
import { getDashboard } from '../api/sign';
import type { DashboardData } from '../types';

const statCards = [
  { key: 'today_sign_count', label: '今日签到', suffix: '', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
  ), iconBg: 'bg-blue-500' },
  { key: 'month_revenue', label: '本月收入', suffix: '', isMoney: true, icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ), iconBg: 'bg-emerald-500' },
  { key: 'expiring_soon', label: '即将到期', suffix: '', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  ), iconBg: 'bg-amber-500' },
  { key: 'total_members', label: '总会员数', suffix: '', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  ), iconBg: 'bg-violet-500' },
  { key: 'active_members', label: '活跃会员', suffix: '', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
  ), iconBg: 'bg-pink-500' },
  { key: 'today_new_members', label: '今日新增', suffix: '', icon: (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" /></svg>
  ), iconBg: 'bg-indigo-500' },
];

const dayLabels = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];

export default function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await getDashboard();
      setData(response.data.data);
    } catch (err) {
      console.error('获取仪表盘数据失败', err);
    } finally {
      setLoading(false);
    }
  };

  const formatValue = (card: typeof statCards[0]) => {
    if (!data) return '-';
    const val = data[card.key as keyof DashboardData];
    if (card.isMoney) {
      return `¥${Number(val).toLocaleString()}`;
    }
    return String(val);
  };

  // 计算图表数据
  const trend = data?.week_sign_trend || [];
  const maxCount = Math.max(...trend, 1);

  // 生成最近7天的日期标签
  const last7Days = Array.from({ length: 7 }, (_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return {
      label: dayLabels[d.getDay()],
      date: `${d.getMonth() + 1}/${d.getDate()}`,
      isToday: i === 6,
    };
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="flex items-center gap-2 text-gray-400">
          <svg className="animate-spin w-5 h-5" viewBox="0 0 24 24" fill="none">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          加载中...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页头 */}
      <div>
        <h1 className="page-title">数据概览</h1>
        <p className="page-desc">实时掌握门店运营动态</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-4">
        {statCards.map((card) => (
          <div key={card.key} className="card card-hover p-5">
            <div className={`inline-flex items-center justify-center w-10 h-10 ${card.iconBg} text-white rounded-lg mb-3`}>
              {card.icon}
            </div>
            <p className="text-[26px] font-bold text-gray-900 dark:text-white leading-tight tracking-tight">
              {formatValue(card)}
            </p>
            <p className="text-[13px] text-gray-500 dark:text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* 签到趋势 */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">近7天签到趋势</h2>
            <p className="text-xs text-gray-400 mt-0.5">每日签到人次统计</p>
          </div>
          {data && (
            <div className="text-right">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                7日累计 <span className="font-semibold text-blue-600 dark:text-blue-400">{trend.reduce((a, b) => a + b, 0)}</span> 人次
              </p>
            </div>
          )}
        </div>

        {trend.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-gray-400">
            <svg className="w-12 h-12 mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <p className="text-sm">暂无签到数据</p>
          </div>
        ) : (
          <div className="flex items-end justify-between gap-3 h-52">
            {trend.map((count, index) => {
              const day = last7Days[index];
              const heightPct = (count / maxCount) * 100;
              const isEmpty = count === 0;

              return (
                <div key={index} className="flex-1 flex flex-col items-center gap-2 min-w-0">
                  {/* 数值 */}
                  <span className={`text-xs font-medium ${isEmpty ? 'text-gray-300 dark:text-gray-600' : 'text-gray-700 dark:text-gray-300'}`}>
                    {count}
                  </span>

                  {/* 柱子容器 */}
                  <div className="w-full max-w-[48px] h-36 flex items-end">
                    <div
                      className={`w-full rounded-t-md transition-all duration-300 ${
                        isEmpty
                          ? 'bg-gray-100 dark:bg-gray-700/50'
                          : day?.isToday
                            ? 'bg-gradient-to-t from-blue-600 to-blue-400'
                            : 'bg-gradient-to-t from-blue-200 to-blue-300 dark:from-blue-800 dark:to-blue-600 hover:from-blue-300 hover:to-blue-400'
                      }`}
                      style={{ height: isEmpty ? '4px' : `${Math.max(heightPct, 6)}%` }}
                      title={`${day?.label} ${count} 次`}
                    />
                  </div>

                  {/* 日期标签 */}
                  <div className="text-center">
                    <p className={`text-xs ${day?.isToday ? 'font-semibold text-blue-600 dark:text-blue-400' : 'text-gray-500 dark:text-gray-400'}`}>
                      {day?.isToday ? '今天' : day?.label}
                    </p>
                    <p className="text-[10px] text-gray-400 dark:text-gray-500">{day?.date}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
