import { useState, useEffect } from 'react';
import { getDashboard } from '../api/sign';
import type { DashboardData } from '../types';

const statCards = [
  { key: 'today_sign_count', label: '今日签到', iconBg: '#3b5bfd', icon: (
    <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
  )},
  { key: 'month_revenue', label: '本月收入', isMoney: true, iconBg: '#10b981', icon: (
    <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  )},
  { key: 'expiring_soon', label: '即将到期', iconBg: '#f59e0b', icon: (
    <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
  )},
  { key: 'total_members', label: '总会员数', iconBg: '#8b5cf6', icon: (
    <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
  )},
  { key: 'active_members', label: '活跃会员', iconBg: '#ec4899', icon: (
    <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
  )},
  { key: 'online_count', label: '在线员工', iconBg: '#06b6d4', icon: (
    <svg width="19" height="19" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
  )},
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
    if (card.isMoney) return `¥${Number(val).toLocaleString()}`;
    return String(val ?? 0);
  };

  const trend = data?.week_sign_trend || [];
  const maxCount = Math.max(...trend, 1);
  const weekTotal = trend.reduce((a, b) => a + b, 0);

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
    <div className="space-y-5">
      {/* 页头 */}
      <div className="flex items-end justify-between">
        <div>
          <h1 className="page-title">数据概览</h1>
          <p className="page-desc">实时掌握门店运营动态</p>
        </div>
        <div className="flex gap-3">
          <button className="btn btn-secondary">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            导出报表
          </button>
          <button className="btn btn-primary">
            <svg width="16" height="16" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            快速签到
          </button>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-6 gap-3.5">
        {statCards.map((card) => (
          <div key={card.key} className="card card-hover p-5">
            <div
              className="inline-flex items-center justify-center w-[38px] h-[38px] text-white rounded-[10px] mb-3.5"
              style={{ background: card.iconBg }}
            >
              {card.icon}
            </div>
            <p className="text-2xl font-bold text-[#1a2233] dark:text-white leading-tight tracking-tight">
              {formatValue(card)}
            </p>
            <p className="text-[12.5px] text-[#94a3b8] dark:text-gray-400 mt-1">{card.label}</p>
          </div>
        ))}
      </div>

      {/* 图表 + 到期提醒 */}
      <div className="grid grid-cols-1 xl:grid-cols-[1.6fr_1fr] gap-3.5">
        {/* 签到趋势 */}
        <div className="card">
          <div className="px-6 pt-5 flex items-center justify-between">
            <div>
              <h2 className="text-[15.5px] font-semibold text-[#1a2233] dark:text-white">近7天签到趋势</h2>
              <p className="text-xs text-[#94a3b8] mt-0.5">每日签到人次 · 累计 {weekTotal} 人次</p>
            </div>
            <span className="badge badge-info"><span className="dot"></span>实时</span>
          </div>
          <div className="px-6 pb-6 pt-5">
            {trend.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                <svg className="w-12 h-12 mb-3 empty-icon" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                <p className="text-sm">暂无签到数据</p>
              </div>
            ) : (
              <div className="flex items-end justify-between gap-3 h-48 pt-2">
                {trend.map((count, index) => {
                  const day = last7Days[index];
                  const heightPct = (count / maxCount) * 100;
                  const isEmpty = count === 0;

                  return (
                    <div key={index} className="flex-1 flex flex-col items-center gap-2 min-w-0 h-full justify-end group">
                      <span className={`text-[11.5px] font-semibold ${isEmpty ? 'text-[#cbd5e1] dark:text-gray-600' : 'text-[#4a5568] dark:text-gray-300'}`}>
                        {count}
                      </span>
                      <div className="w-full max-w-[40px] flex-1 flex items-end">
                        <div
                          className={`w-full rounded-t-md transition-all duration-200 ${
                            isEmpty
                              ? 'bg-[#eef1f6] dark:bg-gray-700/50 !h-[3px] !rounded-[3px]'
                              : day?.isToday
                                ? 'bg-gradient-to-t from-[#2947d6] to-[#3b5bfd]'
                                : 'bg-gradient-to-t from-[#c7d4fe] to-[#dbe4ff] group-hover:from-[#a5bcfd] group-hover:to-[#c7d4fe] dark:from-blue-800 dark:to-blue-600'
                          }`}
                          style={isEmpty ? {} : { height: `${Math.max(heightPct, 6)}%` }}
                          title={`${day?.label} ${count} 次`}
                        />
                      </div>
                      <div className="text-center">
                        <p className={`text-[11.5px] leading-tight ${day?.isToday ? 'font-semibold text-[#3b5bfd] dark:text-blue-400' : 'text-[#94a3b8] dark:text-gray-400'}`}>
                          {day?.isToday ? '今天' : day?.label}
                        </p>
                        <p className="text-[10px] text-[#cbd5e1] dark:text-gray-500">{day?.date}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* 即将到期 */}
        <div className="card">
          <div className="px-6 pt-5 flex items-center justify-between">
            <div>
              <h2 className="text-[15.5px] font-semibold text-[#1a2233] dark:text-white">即将到期</h2>
              <p className="text-xs text-[#94a3b8] mt-0.5">7 天内到期的会员卡</p>
            </div>
            <button className="link-btn text-[13px]">查看全部</button>
          </div>
          <div className="px-6 pb-6 pt-3">
            {!data || data.expiring_soon === 0 ? (
              <div className="flex flex-col items-center justify-center py-14 text-gray-400">
                <svg className="w-11 h-11 mb-3 empty-icon" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm">暂无即将到期的会员卡</p>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-14 text-gray-400">
                <p className="text-sm">共 {data.expiring_soon} 张卡即将到期</p>
                <p className="text-xs text-[#94a3b8] mt-1">到期列表功能开发中</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
