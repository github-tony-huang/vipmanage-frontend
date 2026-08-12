import { useState, useEffect } from 'react';
import { getRoleList, getPermissionList, createRole, updateRole, deleteRole, setRolePermissions } from '../../api/admin';
import type { Role, Permission } from '../../types';

export default function RoleList() {
  const [roles, setRoles] = useState<Role[]>([]);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(false);
  const [showRoleModal, setShowRoleModal] = useState(false);
  const [showPermModal, setShowPermModal] = useState(false);
  const [editingRole, setEditingRole] = useState<Role | null>(null);
  const [currentRole, setCurrentRole] = useState<Role | null>(null);
  const [roleForm, setRoleForm] = useState({ name: '', code: '', remark: '' });
  const [selectedPermIDs, setSelectedPermIDs] = useState<number[]>([]);

  useEffect(() => {
    fetchRoles();
    fetchPermissions();
  }, []);

  const fetchRoles = async () => {
    setLoading(true);
    try {
      const response = await getRoleList();
      setRoles(response.data.data);
    } catch (err) {
      console.error('获取角色列表失败', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchPermissions = async () => {
    try {
      const response = await getPermissionList();
      setPermissions(response.data.data);
    } catch (err) {
      console.error('获取权限列表失败', err);
    }
  };

  const openCreateRole = () => {
    setEditingRole(null);
    setRoleForm({ name: '', code: '', remark: '' });
    setShowRoleModal(true);
  };

  const openEditRole = (role: Role) => {
    setEditingRole(role);
    setRoleForm({ name: role.name, code: role.code, remark: role.remark || '' });
    setShowRoleModal(true);
  };

  const handleSaveRole = async () => {
    try {
      if (editingRole) {
        await updateRole(editingRole.id, roleForm);
      } else {
        await createRole(roleForm);
      }
      setShowRoleModal(false);
      fetchRoles();
    } catch (err: any) {
      alert(err.message || '保存失败');
    }
  };

  const handleDeleteRole = async (id: number) => {
    if (!confirm('确定要删除该角色吗？')) return;
    try {
      await deleteRole(id);
      fetchRoles();
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  };

  const openPermModal = (role: Role) => {
    setCurrentRole(role);
    setSelectedPermIDs(role.permission_ids || []);
    setShowPermModal(true);
  };

  const togglePerm = (permID: number) => {
    setSelectedPermIDs((prev) =>
      prev.includes(permID) ? prev.filter((id) => id !== permID) : [...prev, permID]
    );
  };

  const handleSavePerms = async () => {
    if (!currentRole) return;
    try {
      await setRolePermissions(currentRole.id, selectedPermIDs);
      setShowPermModal(false);
      fetchRoles();
    } catch (err: any) {
      alert(err.message || '设置失败');
    }
  };

  const groupedPermissions = permissions.reduce<Record<string, Permission[]>>((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {});

  const moduleNames: Record<string, string> = {
    member: '会员管理', cardtype: '卡种管理', card: '会员卡管理',
    sign: '签到管理', transaction: '交易管理', admin: '系统管理',
  };

  return (
    <div className="space-y-5">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">角色权限管理</h1>
          <p className="page-desc">共 {roles.length} 个角色</p>
        </div>
        <button onClick={openCreateRole} className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          添加角色
        </button>
      </div>

      {/* 角色列表 */}
      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>角色名称</th>
              <th>编码</th>
              <th>权限数</th>
              <th>备注</th>
              <th className="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="!py-16 text-center text-gray-400">加载中...</td></tr>
            ) : roles.length === 0 ? (
              <tr>
                <td colSpan={5} className="!py-16 text-center text-gray-400">
                  <svg className="w-10 h-10 mx-auto mb-2 empty-icon" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                  暂无角色
                </td>
              </tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id}>
                  <td className="font-medium">{role.name}</td>
                  <td className="font-mono text-[13px] text-gray-500 dark:text-gray-400">{role.code}</td>
                  <td><span className="badge badge-info">{role.permission_ids?.length || 0} 项权限</span></td>
                  <td className="text-gray-500 dark:text-gray-400">{role.remark || '-'}</td>
                  <td>
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => openPermModal(role)} className="link-btn success">配置权限</button>
                      <button onClick={() => openEditRole(role)} className="link-btn">编辑</button>
                      <button onClick={() => handleDeleteRole(role.id)} className="link-btn danger">删除</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 角色编辑弹窗 */}
      {showRoleModal && (
        <div className="modal-mask" onClick={() => setShowRoleModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[#1a2233] dark:text-white mb-5">
              {editingRole ? '编辑角色' : '添加角色'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">角色名称 <span className="text-red-500">*</span></label>
                <input type="text" value={roleForm.name} onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })} className="input" placeholder="如：店长" />
              </div>
              <div>
                <label className="label">角色编码 <span className="text-red-500">*</span></label>
                <input type="text" value={roleForm.code} onChange={(e) => setRoleForm({ ...roleForm, code: e.target.value })} className="input font-mono" placeholder="如：manager" />
              </div>
              <div>
                <label className="label">备注</label>
                <input type="text" value={roleForm.remark} onChange={(e) => setRoleForm({ ...roleForm, remark: e.target.value })} className="input" placeholder="选填" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowRoleModal(false)} className="btn btn-secondary">取消</button>
              <button onClick={handleSaveRole} className="btn btn-primary">保存</button>
            </div>
          </div>
        </div>
      )}

      {/* 权限配置弹窗 */}
      {showPermModal && currentRole && (
        <div className="modal-mask" onClick={() => setShowPermModal(false)}>
          <div className="modal-card !max-w-lg max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[#1a2233] dark:text-white mb-4">
              配置权限 · {currentRole.name}
            </h2>
            <div className="flex-1 overflow-y-auto space-y-5 pr-1 -mx-1 px-1">
              {Object.entries(groupedPermissions).map(([module, perms]) => (
                <div key={module}>
                  <h3 className="text-[13px] font-semibold text-[#4a5568] dark:text-gray-300 mb-2.5">
                    {moduleNames[module] || module}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {perms.map((perm) => (
                      <label
                        key={perm.id}
                        className={`flex items-center gap-2.5 px-3 py-2.5 rounded-[9px] border cursor-pointer transition-all text-sm ${
                          selectedPermIDs.includes(perm.id)
                            ? 'border-[#3b5bfd] bg-[#eef1ff] dark:bg-[#3b5bfd]/15 text-[#1a2233] dark:text-white'
                            : 'border-[#e8ecf1] dark:border-gray-600 hover:border-[#94a3b8] text-[#4a5568] dark:text-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermIDs.includes(perm.id)}
                          onChange={() => togglePerm(perm.id)}
                          className="rounded text-[#3b5bfd] accent-[#3b5bfd]"
                        />
                        {perm.name}
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-5 pt-4 border-t border-[#e8ecf1] dark:border-gray-700">
              <button onClick={() => setShowPermModal(false)} className="btn btn-secondary">取消</button>
              <button onClick={handleSavePerms} className="btn btn-primary">保存（已选 {selectedPermIDs.length} 项）</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
