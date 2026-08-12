import request from './request';
import type {
  ApiResponse,
  OnlineListResponse,
  Role,
  Permission,
  Staff,
  OperationLog,
  PageResponse,
} from '../types';

// ========== 在线会话管理 ==========

// 获取在线用户列表
export const getOnlineList = () => {
  return request.get<ApiResponse<OnlineListResponse>>('/admin/online');
};

// 踢人下线（jti 为空踢该用户全部会话）
export const kickUser = (data: { admin_id: number; jti?: string }) => {
  return request.post<ApiResponse<any>>('/admin/online/kick', data);
};

// 按 ID 踢人
export const kickUserByID = (adminID: number) => {
  return request.post<ApiResponse<any>>(`/admin/online/kick/${adminID}`);
};

// 登出
export const logout = () => {
  return request.post<ApiResponse<any>>('/admin/logout');
};

// ========== 角色权限管理 ==========

// 角色列表
export const getRoleList = () => {
  return request.get<ApiResponse<Role[]>>('/roles');
};

// 创建角色
export const createRole = (data: { name: string; code: string; remark?: string }) => {
  return request.post<ApiResponse<Role>>('/roles', data);
};

// 更新角色
export const updateRole = (id: number, data: { name: string; code: string; remark?: string }) => {
  return request.put<ApiResponse<Role>>(`/roles/${id}`, data);
};

// 删除角色
export const deleteRole = (id: number) => {
  return request.delete<ApiResponse<any>>(`/roles/${id}`);
};

// 权限列表
export const getPermissionList = () => {
  return request.get<ApiResponse<Permission[]>>('/permissions');
};

// 设置角色权限
export const setRolePermissions = (id: number, permissionIDs: number[]) => {
  return request.put<ApiResponse<any>>(`/roles/${id}/permissions`, { permission_ids: permissionIDs });
};

// ========== 员工账号管理 ==========

// 员工列表
export const getStaffList = () => {
  return request.get<ApiResponse<Staff[]>>('/admin/staff');
};

// 创建员工
export const createStaff = (data: { username: string; password: string; nickname?: string; role?: number }) => {
  return request.post<ApiResponse<any>>('/admin/staff', data);
};

// 编辑员工
export const updateStaff = (id: number, data: { nickname?: string; role?: number; status?: number }) => {
  return request.put<ApiResponse<any>>(`/admin/staff/${id}`, data);
};

// 删除员工（停用）
export const deleteStaff = (id: number) => {
  return request.delete<ApiResponse<any>>(`/admin/staff/${id}`);
};

// 重置密码
export const resetStaffPassword = (id: number, password: string) => {
  return request.put<ApiResponse<any>>(`/admin/staff/${id}/password`, { password });
};

// ========== 操作日志 ==========

// 操作日志列表
export const getOperationLogs = (params?: { page?: number; page_size?: number; module?: string }) => {
  return request.get<ApiResponse<PageResponse<OperationLog>>>('/admin/operation-logs', { params });
};
