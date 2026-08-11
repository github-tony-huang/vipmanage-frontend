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

  // 按模块分组权限
  const groupedPermissions = permissions.reduce<Record<string, Permission[]>>((acc, perm) => {
    if (!acc[perm.module]) acc[perm.module] = [];
    acc[perm.module].push(perm);
    return acc;
  }, {});

  const moduleNames: Record<string, string> = {
    member: '会员管理',
    cardtype: '卡种管理',
    card: '会员卡管理',
    sign: '签到管理',
    transaction: '交易管理',
    admin: '系统管理',
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">角色权限管理</h1>
        <button
          onClick={openCreateRole}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          添加角色
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">角色名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">编码</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">权限数</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">备注</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">加载中...</td></tr>
            ) : roles.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">暂无数据</td></tr>
            ) : (
              roles.map((role) => (
                <tr key={role.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{role.name}</td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400 font-mono text-sm">{role.code}</td>
                  <td className="px-6 py-4">
                    <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
                      {role.permission_ids?.length || 0} 项权限
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 dark:text-gray-400">{role.remark || '-'}</td>
                  <td className="px-6 py-4 text-right space-x-3">
                    <button onClick={() => openPermModal(role)} className="text-green-600 hover:text-green-800 dark:text-green-400 text-sm">
                      配置权限
                    </button>
                    <button onClick={() => openEditRole(role)} className="text-blue-600 hover:text-blue-800 dark:text-blue-400 text-sm">
                      编辑
                    </button>
                    <button onClick={() => handleDeleteRole(role.id)} className="text-red-600 hover:text-red-800 dark:text-red-400 text-sm">
                      删除
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 角色编辑弹窗 */}
      {showRoleModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingRole ? '编辑角色' : '添加角色'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">角色名称</label>
                <input
                  type="text"
                  value={roleForm.name}
                  onChange={(e) => setRoleForm({ ...roleForm, name: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="如：店长"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">角色编码</label>
                <input
                  type="text"
                  value={roleForm.code}
                  onChange={(e) => setRoleForm({ ...roleForm, code: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white font-mono"
                  placeholder="如：manager"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">备注</label>
                <input
                  type="text"
                  value={roleForm.remark}
                  onChange={(e) => setRoleForm({ ...roleForm, remark: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowRoleModal(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">
                取消
              </button>
              <button onClick={handleSaveRole} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                保存
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 权限配置弹窗 */}
      {showPermModal && currentRole && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-lg max-h-[80vh] flex flex-col">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              配置权限 - {currentRole.name}
            </h2>
            <div className="flex-1 overflow-y-auto space-y-4 pr-2">
              {Object.entries(groupedPermissions).map(([module, perms]) => (
                <div key={module}>
                  <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    {moduleNames[module] || module}
                  </h3>
                  <div className="grid grid-cols-2 gap-2">
                    {perms.map((perm) => (
                      <label
                        key={perm.id}
                        className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-colors ${
                          selectedPermIDs.includes(perm.id)
                            ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                            : 'border-gray-200 dark:border-gray-700 hover:border-gray-300'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={selectedPermIDs.includes(perm.id)}
                          onChange={() => togglePerm(perm.id)}
                          className="rounded text-blue-600"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">{perm.name}</span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button onClick={() => setShowPermModal(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300">
                取消
              </button>
              <button onClick={handleSavePerms} className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                保存（已选 {selectedPermIDs.length} 项）
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
