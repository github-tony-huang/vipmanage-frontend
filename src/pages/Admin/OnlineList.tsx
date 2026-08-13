import { useState, useEffect } from 'react';
import { getOnlineList, kickUser } from '../../api/admin';
import type { OnlineUser } from '../../types';
import { formatTime } from '../../utils/format';

export default function OnlineList() {
  const [data, setData] = useState<{ total_users: number; total_sessions: number; list: OnlineUser[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchData();
    const timer = setInterval(() => fetchData(true), 30000);
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
    const target = jti ? '该会话' : `${nickname} 的所有会话`;
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

  const getRemainCls = (sec: number) => {
    if (sec <= 600) return 'text-red-600 dark:text-red-400 font-medium';
    if (sec <= 1800) return 'text-amber-600 dark:text-amber-400';
    return 'text-gray-500 dark:text-gray-400';
  };

  return (
    <div className="space-y-5">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">在线管理</h1>
          <p className="page-desc">
            {data ? `当前 ${data.total_users} 人在线，共 ${data.total_sessions} 个有效会话` : '实时会话监控'}
          </p>
        </div>
        <button onClick={() => fetchData()} disabled={refreshing} className="btn btn-secondary">
          <svg className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          {refreshing ? '刷新中' : '刷新'}
        </button>
      </div>

      {/* 列表 */}
      {loading ? (
        <div className="card p-16 text-center text-gray-400">加载中...</div>
      ) : !data || data.list.length === 0 ? (
        <div className="card p-16 text-center text-gray-400">
          <svg className="w-11 h-11 mx-auto mb-3 empty-icon" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" />
          </svg>
          暂无在线用户
        </div>
      ) : (
        data.list.map((user) => (
          <div key={user.admin_id} className="card overflow-hidden">
            {/* 用户头 */}
            <div className="px-6 py-4 bg-[#f7f8fa] dark:bg-gray-700/40 border-b border-[#e8ecf1] dark:border-gray-700/60 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-[#3b5bfd] to-[#6a4dff] rounded-full flex items-center justify-center">
                  <span className="text-white text-sm font-semibold">
                    {user.nickname?.charAt(0) || user.username.charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#1a2233] dark:text-white">
                    {user.nickname || user.username}
                    <span className="ml-2 text-[13px] font-normal text-gray-400">@{user.username}</span>
                  </p>
                  <p className="text-xs text-[#94a3b8]">{user.role_text} · {user.sessions.length} 个会话</p>
                </div>
              </div>
              <button onClick={() => handleKick(user.admin_id, undefined, user.nickname)} className="btn btn-sm border border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 bg-white dark:bg-transparent hover:bg-red-50 dark:hover:bg-red-900/20">
                踢掉所有会话
              </button>
            </div>

            {/* 会话表格 */}
            <table className="table">
              <thead>
                <tr>
                  <th>设备</th>
                  <th>登录时间</th>
                  <th>剩余有效期</th>
                  <th>IP 地址</th>
                  <th className="text-right">操作</th>
                </tr>
              </thead>
              <tbody>
                {user.sessions.map((sess) => (
                  <tr key={sess.jti}>
                    <td>
                      <span className={`badge ${sess.device === 'mobile' ? '' : 'badge-info'}`}
                        style={sess.device === 'mobile' ? { background: '#f3e8ff', color: '#7e22ce' } : {}}>
                        {sess.device === 'mobile' ? (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>
                        ) : (
                          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" /></svg>
                        )}
                        {sess.device_text}
                      </span>
                      {sess.is_current && (
                        <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400 font-medium">(当前会话)</span>
                      )}
                    </td>
                    <td className="text-gray-600 dark:text-gray-300 text-[13px]">{formatTime(sess.login_time)}</td>
                    <td><span className={`text-[13px] ${getRemainCls(sess.remain_sec)}`}>{formatRemain(sess.remain_sec)}</span></td>
                    <td className="text-gray-400 dark:text-gray-500 text-[13px] font-mono">{sess.ip}</td>
                    <td>
                      <div className="flex justify-end">
                        {!sess.is_current && (
                          <button onClick={() => handleKick(user.admin_id, sess.jti, user.nickname)} className="link-btn danger">踢下线</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ))
      )}
    </div>
  );
}
