import { useState, useEffect } from 'react';
import { getStaffList, createStaff, updateStaff, resetStaffPassword } from '../../api/admin';
import type { Staff } from '../../types';
import { formatTime } from '../../utils/format';

export default function StaffList() {
  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showPwdModal, setShowPwdModal] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [pwdTarget, setPwdTarget] = useState<Staff | null>(null);
  const [formData, setFormData] = useState({ username: '', password: '', nickname: '', role: 2 });
  const [newPassword, setNewPassword] = useState('');

  useEffect(() => {
    fetchStaffs();
  }, []);

  const fetchStaffs = async () => {
    setLoading(true);
    try {
      const response = await getStaffList();
      setStaffs(response.data.data);
    } catch (err) {
      console.error('获取员工列表失败', err);
    } finally {
      setLoading(false);
    }
  };

  const openCreate = () => {
    setEditingStaff(null);
    setFormData({ username: '', password: '', nickname: '', role: 2 });
    setShowModal(true);
  };

  const openEdit = (staff: Staff) => {
    setEditingStaff(staff);
    setFormData({ username: staff.username, password: '', nickname: staff.nickname, role: staff.role });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    try {
      if (editingStaff) {
        await updateStaff(editingStaff.id, { nickname: formData.nickname, role: formData.role, status: editingStaff.status });
      } else {
        await createStaff(formData);
      }
      setShowModal(false);
      fetchStaffs();
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const handleResetPassword = async () => {
    if (!pwdTarget) return;
    try {
      await resetStaffPassword(pwdTarget.id, newPassword);
      setShowPwdModal(false);
      setNewPassword('');
      setPwdTarget(null);
      alert('密码已重置');
    } catch (err: any) {
      alert(err.message || '重置失败');
    }
  };

  const handleToggleStatus = async (staff: Staff) => {
    const newStatus = staff.status === 1 ? 0 : 1;
    try {
      await updateStaff(staff.id, { status: newStatus });
      fetchStaffs();
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  return (
    <div className="space-y-5">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">员工管理</h1>
          <p className="page-desc">共 {staffs.length} 个账号</p>
        </div>
        <button onClick={openCreate} className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          添加员工
        </button>
      </div>

      {/* 列表 */}
      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>用户名</th>
              <th>昵称</th>
              <th>角色</th>
              <th>状态</th>
              <th>创建时间</th>
              <th className="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="!py-16 text-center text-gray-400">加载中...</td></tr>
            ) : staffs.length === 0 ? (
              <tr>
                <td colSpan={6} className="!py-16 text-center text-gray-400">
                  <svg className="w-10 h-10 mx-auto mb-2 empty-icon" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  暂无员工
                </td>
              </tr>
            ) : (
              staffs.map((staff) => (
                <tr key={staff.id}>
                  <td className="font-medium">{staff.username}</td>
                  <td className="text-gray-600 dark:text-gray-300">{staff.nickname || '-'}</td>
                  <td>
                    {staff.role === 1
                      ? <span className="badge badge-info"><span className="dot"></span>{staff.role_text}</span>
                      : <span className="badge badge-muted"><span className="dot"></span>{staff.role_text}</span>}
                  </td>
                  <td>
                    {staff.status === 1
                      ? <span className="badge badge-success"><span className="dot"></span>正常</span>
                      : <span className="badge badge-danger"><span className="dot"></span>停用</span>}
                  </td>
                  <td className="text-gray-500 dark:text-gray-400 text-[13px]">{formatTime(staff.created_at)}</td>
                  <td>
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => { setPwdTarget(staff); setNewPassword(''); setShowPwdModal(true); }} className="link-btn warning">重置密码</button>
                      <button onClick={() => openEdit(staff)} className="link-btn">编辑</button>
                      {staff.username !== 'admin' && (
                        <button onClick={() => handleToggleStatus(staff)} className="link-btn">
                          {staff.status === 1 ? '停用' : '启用'}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 创建/编辑弹窗 */}
      {showModal && (
        <div className="modal-mask" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[#1a2233] dark:text-white mb-5">
              {editingStaff ? '编辑员工' : '添加员工'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">用户名 <span className="text-red-500">*</span></label>
                <input type="text" value={formData.username} disabled={!!editingStaff} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="input disabled:opacity-50" placeholder="登录用户名" />
              </div>
              {!editingStaff && (
                <div>
                  <label className="label">密码 <span className="text-red-500">*</span></label>
                  <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="input" placeholder="初始密码" />
                </div>
              )}
              <div>
                <label className="label">昵称</label>
                <input type="text" value={formData.nickname} onChange={(e) => setFormData({ ...formData, nickname: e.target.value })} className="input" placeholder="显示名称" />
              </div>
              <div>
                <label className="label">角色</label>
                <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: Number(e.target.value) })} className="input">
                  <option value={1}>管理员</option>
                  <option value={2}>操作员</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">取消</button>
              <button onClick={handleSubmit} className="btn btn-primary">{editingStaff ? '保存' : '创建'}</button>
            </div>
          </div>
        </div>
      )}

      {/* 重置密码弹窗 */}
      {showPwdModal && pwdTarget && (
        <div className="modal-mask" onClick={() => setShowPwdModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[#1a2233] dark:text-white mb-2">重置密码</h2>
            <p className="text-sm text-[#94a3b8] mb-4">正在重置 <span className="font-medium text-[#1a2233] dark:text-white">{pwdTarget.username}</span> 的密码</p>
            <div>
              <label className="label">新密码 <span className="text-red-500">*</span></label>
              <input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} className="input" placeholder="请输入新密码" />
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowPwdModal(false)} className="btn btn-secondary">取消</button>
              <button onClick={handleResetPassword} className="btn btn-primary">确认重置</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
