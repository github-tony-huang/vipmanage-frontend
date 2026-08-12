import { useState, useEffect } from 'react';
import { getOperationLogs } from '../../api/admin';
import type { OperationLog } from '../../types';

const moduleNames: Record<string, string> = {
  member: '会员管理', cardtype: '卡种管理', card: '会员卡管理',
  sign: '签到管理', transaction: '交易管理', admin: '系统管理',
  role: '角色权限', auth: '认证', export: '数据导出', other: '其他',
};

const actionNames: Record<string, string> = {
  create: '创建', update: '更新', delete: '删除', freeze: '冻结', unfreeze: '解冻',
  issue: '开卡', renew: '续卡', transfer: '转卡', refund: '退卡', recharge: '充值',
  sign: '签到', login: '登录', logout: '登出', kick: '踢下线',
  reset_password: '重置密码', set_permissions: '配置权限', online: '在线管理',
};

const actionBadges: Record<string, string> = {
  create: 'badge-success', update: 'badge-info', delete: 'badge-danger',
  freeze: 'badge-warning', unfreeze: 'badge-info', issue: 'badge-success',
  renew: 'badge-success', transfer: 'badge-info', refund: 'badge-danger',
  recharge: 'badge-success', sign: 'badge-info', login: 'badge-muted',
  logout: 'badge-muted', kick: 'badge-danger', reset_password: 'badge-warning',
  set_permissions: 'badge-info', online: 'badge-muted',
};

export default function OperationLogList() {
  const [logs, setLogs] = useState<OperationLog[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [moduleFilter, setModuleFilter] = useState('');

  useEffect(() => {
    fetchLogs();
  }, [page, moduleFilter]);

  const fetchLogs = async () => {
    setLoading(true);
    try {
      const params: any = { page, page_size: pageSize };
      if (moduleFilter) params.module = moduleFilter;
      const response = await getOperationLogs(params);
      setLogs(response.data.data.list);
      setTotal(response.data.data.total);
    } catch (err) {
      console.error('获取操作日志失败', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* 页头 */}
      <div>
        <h1 className="page-title">操作日志</h1>
        <p className="page-desc">系统操作记录追溯</p>
      </div>

      {/* 列表 */}
      <div className="card overflow-hidden">
        {/* 筛选栏 */}
        <div className="px-6 py-4 border-b border-[#e8ecf1] dark:border-gray-700/60 flex items-center gap-3">
          <select value={moduleFilter} onChange={(e) => { setModuleFilter(e.target.value); setPage(1); }} className="input !h-9 !w-auto text-[13px]">
            <option value="">全部模块</option>
            {Object.entries(moduleNames).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
          {moduleFilter && (
            <button onClick={() => { setModuleFilter(''); setPage(1); }} className="link-btn">清除筛选</button>
          )}
        </div>

        <table className="table">
          <thead>
            <tr>
              <th>操作人</th>
              <th>模块</th>
              <th>操作</th>
              <th>详情</th>
              <th>IP</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="!py-16 text-center text-gray-400">加载中...</td></tr>
            ) : logs.length === 0 ? (
              <tr>
                <td colSpan={6} className="!py-16 text-center text-gray-400">
                  <svg className="w-10 h-10 mx-auto mb-2 empty-icon" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  暂无操作日志
                </td>
              </tr>
            ) : (
              logs.map((log) => (
                <tr key={log.id}>
                  <td className="font-medium">{log.admin_name || `ID:${log.admin_id}`}</td>
                  <td className="text-gray-600 dark:text-gray-300">{moduleNames[log.module] || log.module}</td>
                  <td>
                    <span className={`badge ${actionBadges[log.action] || 'badge-muted'}`}>
                      <span className="dot"></span>
                      {actionNames[log.action] || log.action}
                    </span>
                  </td>
                  <td className="text-gray-500 dark:text-gray-400 text-[13px] font-mono truncate max-w-[200px]">{log.detail || '-'}</td>
                  <td className="text-gray-400 dark:text-gray-500 text-[13px] font-mono">{log.ip}</td>
                  <td className="text-gray-500 dark:text-gray-400 text-[13px]">{log.created_at}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {total > pageSize && (
          <div className="px-5 py-3.5 flex justify-between items-center border-t border-[#e8ecf1] dark:border-gray-700/60">
            <span className="text-[13px] text-gray-400">共 {total} 条 · 第 {page} / {Math.ceil(total / pageSize)} 页</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(page - 1)} disabled={page === 1} className="btn btn-secondary btn-sm">上一页</button>
              <button onClick={() => setPage(page + 1)} disabled={page * pageSize >= total} className="btn btn-secondary btn-sm">下一页</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
