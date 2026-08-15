import { useAuthStore } from '../stores/auth';

/**
 * 权限检查 hook
 * 用法：const { hasPermission } = usePermission();
 *      hasPermission('cardtype:create') // 是否有创建卡种权限
 *      hasPermission('cardtype:edit')   // 是否有编辑卡种权限
 */
export function usePermission() {
  const admin = useAuthStore((state) => state.admin);
  const permissions = admin?.permissions || [];

  const hasPermission = (permCode: string): boolean => {
    if (permissions.includes('*')) return true;
    return permissions.includes(permCode);
  };

  const hasAnyPermission = (permCodes: string[]): boolean => {
    if (permissions.includes('*')) return true;
    return permCodes.some((code) => permissions.includes(code));
  };

  return { hasPermission, hasAnyPermission, permissions };
}
