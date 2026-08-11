import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMemberList, createMember, deleteMember, freezeMember, unfreezeMember } from '../../api/member';
import type { Member, MemberQuery } from '../../types';

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

  const getStatusBadge = (status: number) => {
    const styles = {
      1: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400',
      2: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      3: 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400',
    };
    const texts = { 1: '正常', 2: '冻结', 3: '已删除' };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status as keyof typeof styles] || styles[1]}`}>
        {texts[status as keyof typeof texts] || '未知'}
      </span>
    );
  };

  const getGenderBadge = (gender: number) => {
    const styles = { 0: 'bg-gray-100 text-gray-600', 1: 'bg-blue-100 text-blue-700', 2: 'bg-pink-100 text-pink-700' };
    const texts = { 0: '未知', 1: '男', 2: '女' };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[gender as keyof typeof styles] || styles[0]}`}>
        {texts[gender as keyof typeof texts] || '未知'}
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">会员管理</h1>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          添加会员
        </button>
      </div>

      {/* 搜索栏 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="搜索姓名"
            value={searchName}
            onChange={(e) => { setSearchName(e.target.value); setPage(1); }}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
          <input
            type="text"
            placeholder="搜索手机号"
            value={searchPhone}
            onChange={(e) => { setSearchPhone(e.target.value); setPage(1); }}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
          />
        </div>
      </div>

      {/* 会员列表 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">姓名</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">手机号</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">性别</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">状态</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">注册时间</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">加载中...</td>
              </tr>
            ) : members.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">暂无数据</td>
              </tr>
            ) : (
              members.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Link to={`/members/${member.id}`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400">
                      {member.name}
                    </Link>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-900 dark:text-gray-100">{member.phone}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getGenderBadge(member.gender)}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{getStatusBadge(member.status)}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">{member.created_at}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right space-x-2">
                    <Link to={`/members/${member.id}`} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm">
                      详情
                    </Link>
                    {member.status === 1 ? (
                      <button onClick={() => handleFreeze(member.id)} className="text-yellow-600 hover:text-yellow-800 dark:text-yellow-400 text-sm">
                        冻结
                      </button>
                    ) : member.status === 2 ? (
                      <button onClick={() => handleUnfreeze(member.id)} className="text-green-600 hover:text-green-800 dark:text-green-400 text-sm">
                        解冻
                      </button>
                    ) : null}
                    <button onClick={() => handleDelete(member.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 text-sm">
                      删除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {/* 分页 */}
        {total > pageSize && (
          <div className="px-6 py-4 flex justify-between items-center border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500 dark:text-gray-400">
              共 {total} 条记录，第 {page} / {Math.ceil(total / pageSize)} 页
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setPage(page - 1)}
                disabled={page === 1}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
              >
                上一页
              </button>
              <button
                onClick={() => setPage(page + 1)}
                disabled={page * pageSize >= total}
                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded disabled:opacity-50"
              >
                下一页
              </button>
            </div>
          </div>
        )}
      </div>

      {/* 添加会员弹窗 */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">添加会员</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">姓名</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">手机号</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">性别</label>
                <select
                  value={formData.gender}
                  onChange={(e) => setFormData({ ...formData, gender: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  <option value={0}>未知</option>
                  <option value={1}>男</option>
                  <option value={2}>女</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">
                取消
              </button>
              <button onClick={handleCreate} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                保存
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
