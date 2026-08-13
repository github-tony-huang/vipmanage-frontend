import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMemberList, createMember, deleteMember, freezeMember, unfreezeMember } from '../../api/member';
import { exportMembers } from '../../api/export';
import type { Member, MemberQuery } from '../../types';
import { formatTime } from '../../utils/format';

export default function MemberList() {
  const [members, setMembers] = useState<Member[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', gender: 0 });
  const [searchName, setSearchName] = useState('');
  const [searchPhone, setSearchPhone] = useState('');
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    fetchMembers();
  }, [page, searchName, searchPhone]);

  const fetchMembers = async () => {
    setLoading(true);
    try {
      const params: MemberQuery = { page, page_size: pageSize };
      if (searchName) params.name = searchName;
      if (searchPhone) params.phone = searchPhone;

      const response = await getMemberList(params);
      setMembers(response.data.data.list);
      setTotal(response.data.data.total);
    } catch (err) {
      console.error('获取会员列表失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async () => {
    try {
      await createMember(formData);
      setShowModal(false);
      setFormData({ name: '', phone: '', gender: 0 });
      fetchMembers();
    } catch (err: any) {
      alert(err.message || '创建失败');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该会员吗？')) return;
    try {
      await deleteMember(id);
      fetchMembers();
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  };

  const handleFreeze = async (id: number) => {
    try {
      await freezeMember(id);
      fetchMembers();
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const handleUnfreeze = async (id: number) => {
    try {
      await unfreezeMember(id);
      fetchMembers();
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportMembers();
    } catch (err: any) {
      alert(err.message || '导出失败');
    } finally {
      setExporting(false);
    }
  };

  const getStatusBadge = (status: number) => {
    const map: Record<number, { cls: string; text: string }> = {
      1: { cls: 'badge badge-success', text: '正常' },
      2: { cls: 'badge badge-danger', text: '冻结' },
      3: { cls: 'badge badge-muted', text: '已删除' },
    };
    const item = map[status] || map[1];
    return <span className={item.cls}>{item.text}</span>;
  };

  const getGenderText = (gender: number) => {
    return gender === 1 ? '男' : gender === 2 ? '女' : '未知';
  };

  return (
    <div className="space-y-5">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">会员管理</h1>
          <p className="page-desc">共 {total} 位会员</p>
        </div>
        <div className="flex gap-3">
          <button onClick={handleExport} disabled={exporting} className="btn btn-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
            {exporting ? '导出中...' : '导出'}
          </button>
          <button onClick={() => setShowModal(true)} className="btn btn-primary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          添加会员
          </button>
        </div>
      </div>

      {/* 搜索栏 */}
      <div className="card p-4">
        <div className="flex gap-3">
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="text"
              placeholder="搜索姓名"
              value={searchName}
              onChange={(e) => { setSearchName(e.target.value); setPage(1); }}
              className="input pl-9"
            />
          </div>
          <div className="relative flex-1 max-w-xs">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
            </svg>
            <input
              type="text"
              placeholder="搜索手机号"
              value={searchPhone}
              onChange={(e) => { setSearchPhone(e.target.value); setPage(1); }}
              className="input pl-9"
            />
          </div>
        </div>
      </div>

      {/* 会员列表 */}
      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>姓名</th>
              <th>手机号</th>
              <th>性别</th>
              <th>状态</th>
              <th>注册时间</th>
              <th className="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={6} className="!py-16 text-center">
                  <div className="flex items-center justify-center gap-2 text-gray-400">
                    <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    加载中...
                  </div>
                </td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={6} className="!py-16 text-center text-gray-400">
                  <svg className="w-10 h-10 mx-auto mb-2 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  暂无会员数据
                </td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id}>
                  <td>
                    <Link to={`/members/${member.id}`} className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                      {member.name}
                    </Link>
                  </td>
                  <td className="text-gray-600 dark:text-gray-300">{member.phone}</td>
                  <td className="text-gray-500 dark:text-gray-400">{getGenderText(member.gender)}</td>
                  <td>{getStatusBadge(member.status)}</td>
                  <td className="text-gray-500 dark:text-gray-400 text-[13px]">{formatTime(member.created_at)}</td>
                  <td>
                    <div className="flex items-center justify-end gap-3">
                      <Link to={`/members/${member.id}`} className="link-btn">详情</Link>
                      {member.status === 1 ? (
                        <button onClick={() => handleFreeze(member.id)} className="link-btn warning">冻结</button>
                      ) : member.status === 2 ? (
                        <button onClick={() => handleUnfreeze(member.id)} className="link-btn success">解冻</button>
                      ) : null}
                      <button onClick={() => handleDelete(member.id)} className="link-btn danger">删除</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* 分页 */}
        {total > pageSize && (
          <div className="px-4 py-3 flex justify-between items-center border-t border-gray-100 dark:border-gray-700/60">
            <span className="text-[13px] text-gray-400">
              共 {total} 条 · 第 {page} / {Math.ceil(total / pageSize)} 页
            </span>
            <div className="flex gap-2">
              <button onClick={() => setPage(page - 1)} disabled={page === 1} className="btn btn-secondary btn-sm">上一页</button>
              <button onClick={() => setPage(page + 1)} disabled={page * pageSize >= total} className="btn btn-secondary btn-sm">下一页</button>
            </div>
          </div>
        )}
      </div>

      {/* 添加会员弹窗 */}
      {showModal && (
        <div className="modal-mask" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">添加会员</h2>
            <div className="space-y-4">
              <div>
                <label className="label">姓名 <span className="text-red-500">*</span></label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="input"
                  placeholder="请输入姓名"
                />
              </div>
              <div>
                <label className="label">手机号 <span className="text-red-500">*</span></label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="input"
                  placeholder="请输入手机号"
                />
              </div>
              <div>
                <label className="label">性别</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: Number(e.target.value) })}
                  className="input"
                >
                  <option value={0}>未知</option>
                  <option value={1}>男</option>
                  <option value={2}>女</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">取消</button>
              <button onClick={handleCreate} className="btn btn-primary">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
