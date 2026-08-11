import { useState, useEffect } from 'react';
import { getOnlineList, kickUser } from '../../api/admin';
import type { OnlineUser } from '../../types';

export default function OnlineList() {
  const [data, setData] = useState<{ total_users: number; total_sessions: number; list: OnlineUser[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
    // 每 30 秒自动刷新
    const timer = setInterval(fetchData, 30000);
    return () => clearInterval(timer);
  }, []);

  const fetchData = async (silent = false) => {
    if (!silent) setLoading(true);
    setRefreshing(true);
    try {
      const response = await getOnlineList();
      setData(response.data.data);
    } catch (err) {
      console.error('获取在线列表失败', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleKick = async (adminID: number, jti?: string, nickname?: string) => {
    const target = jti ? `该会话` : `${nickname} 的所有会话`;
    if (!confirm(`确定要踢掉 ${target} 吗？`)) return;
    try {
      await kickUser({ admin_id: adminID, jti });
      fetchData(true);
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const formatRemain = (sec: number) => {
    if (sec <= 0) return '已过期';
    const hours = Math.floor(sec / 3600);
    const minutes = Math.floor((sec % 3600) / 60);
    if (hours > 0) return `${hours}小时${minutes}分`;
    return `${minutes}分钟`;
  };

  const getRemainBadge = (sec: number) => {
    if (sec <= 600) {
      return 'text-red-600 dark:text-red-400 font-medium';
    }
    if (sec <= 1800) {
      return 'text-yellow-600 dark:text-yellow-400';
    }
    return 'text-gray-600 dark:text-gray-400';
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">在线管理</h1>
          {data && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              当前 {data.total_users} 人在线，共 {data.total_sessions} 个有效会话
            </p>
          )}
        </div>
        <button
          onClick={() => fetchData()}
          disabled={refreshing}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {refreshing ? '刷新中...' : '刷新'}
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center text-gray-500">
            加载中...
          </div>
        ) : !data || data.list.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-12 text-center text-gray-500">
            暂无在线用户
          </div>
        ) : (
          data.list.map((user) => (
            <div key={user.admin_id} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
              {/* 用户信息头 */}
              <div className="px-6 py-4 bg-gray-50 dark:bg-gray-700 flex justify-between items-center">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 dark:text-blue-400 font-medium">
                      {user.nickname?.charAt(0) || user.username.charAt(0)}
                    </span>
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">
                      {user.nickname || user.username}
                      <span className="ml-2 text-sm text-gray-500">@{user.username}</span>
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user.role_text}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleKick(user.admin_id, undefined, user.nickname)}
                  className="px-3 py-1.5 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-700 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                >
                  踢掉所有会话
                </button>
              </div>

              {/* 会话列表 */}
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-750 border-t border-gray-200 dark:border-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">设备</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">登录时间</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">剩余有效期</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">IP 地址</th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">操作</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                  {user.sessions.map((sess) => (
                    <tr key={sess.jti} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                          sess.device === 'mobile'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-400'
                            : 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
                        }`}>
                          {sess.device === 'mobile' ? '📱' : '💻'} {sess.device_text}
                        </span>
                        {sess.is_current && (
                          <span className="ml-2 text-xs text-green-600 dark:text-green-400">(当前会话)</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-gray-600 dark:text-gray-300 text-sm">{sess.login_time}</td>
                      <td className="px-6 py-4 text-sm">
                        <span className={getRemainBadge(sess.remain_sec)}>
                          {formatRemain(sess.remain_sec)}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-gray-500 dark:text-gray-400 text-sm font-mono">{sess.ip}</td>
                      <td className="px-6 py-4 text-right">
                        {!sess.is_current && (
                          <button
                            onClick={() => handleKick(user.admin_id, sess.jti, user.nickname)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 text-sm"
                          >
                            踢下线
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
