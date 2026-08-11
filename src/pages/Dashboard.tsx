import { useState, useEffect } from 'react';
import { getDashboard } from '../api/sign';
import type { DashboardData } from '../types';

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

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500 dark:text-gray-400">加载中...</div>
      </div>
    );
  }

  const stats = [
    { label: '今日签到', value: data?.today_sign_count || 0, icon: '✍️', color: 'bg-blue-500' },
    { label: '本月收入', value: `¥${(data?.month_revenue || 0).toLocaleString()}`, icon: '💰', color: 'bg-green-500' },
    { label: '即将到期', value: data?.expiring_soon || 0, icon: '⏰', color: 'bg-yellow-500' },
    { label: '总会员数', value: data?.total_members || 0, icon: '👥', color: 'bg-purple-500' },
    { label: '活跃会员', value: data?.active_members || 0, icon: '🎯', color: 'bg-pink-500' },
    { label: '今日新增', value: data?.today_new_members || 0, icon: '✨', color: 'bg-indigo-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">数据概览</h1>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow"
          >
            <div className="flex items-center">
              <div className={`${stat.color} p-3 rounded-lg mr-4`}>
                <span className="text-xl">{stat.icon}</span>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{stat.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 签到趋势 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">近7天签到趋势</h2>
        <div className="flex items-end justify-between h-48 space-x-2">
          {data?.week_sign_trend?.map((count, index) => {
            const maxCount = Math.max(...(data?.week_sign_trend || [1]));
            const height = maxCount > 0 ? (count / maxCount) * 100 : 0;
            const days = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];
            const today = new Date().getDay();
            const dayIndex = (today - 6 + index + 7) % 7;

            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div className="w-full flex flex-col items-center justify-end h-36">
                  <div
                    className="w-full max-w-12 bg-blue-500 rounded-t-lg transition-all hover:bg-blue-600"
                    style={{ height: `${Math.max(height, 5)}%` }}
                  >
                    <div className="text-center text-white text-xs py-1">{count}</div>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">{days[dayIndex]}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
