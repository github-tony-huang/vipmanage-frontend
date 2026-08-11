import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { logout as logoutApi } from '../api/admin';

const menuItems = [
  { path: '/dashboard', label: '首页', icon: '📊' },
  { path: '/members', label: '会员管理', icon: '👥' },
  { path: '/card-types', label: '卡种管理', icon: '💳' },
  { path: '/member-cards', label: '会员卡管理', icon: '🎫' },
  { path: '/signs', label: '签到记录', icon: '✍️' },
  { path: '/transactions', label: '交易记录', icon: '💰' },
];

const adminMenuItems = [
  { path: '/admin/online', label: '在线管理', icon: '🟢' },
  { path: '/admin/roles', label: '角色权限', icon: '🔐' },
];

export default function Layout() {
  const location = useLocation();
  const { admin, logout } = useAuthStore();

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // 忽略登出接口错误，本地照常清理
    }
    logout();
    window.location.href = '/login';
  };

  const renderMenuItem = (item: { path: string; label: string; icon: string }) => {
    const isActive = location.pathname === item.path;
    return (
      <Link
        key={item.path}
        to={item.path}
        className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
          isActive
            ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
            : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
        }`}
      >
        <span className="mr-3 text-lg">{item.icon}</span>
        <span className="font-medium">{item.label}</span>
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex bg-gray-100 dark:bg-gray-900">
      {/* 侧边栏 */}
      <aside className="w-64 bg-white dark:bg-gray-800 shadow-lg flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center justify-center border-b border-gray-200 dark:border-gray-700">
          <h1 className="text-xl font-bold text-blue-600 dark:text-blue-400">会员管理系统</h1>
        </div>

        {/* 菜单 */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {menuItems.map(renderMenuItem)}

          {/* 系统管理分组 */}
          <div className="pt-4 mt-4 border-t border-gray-200 dark:border-gray-700">
            <p className="px-4 pb-2 text-xs font-medium text-gray-400 dark:text-gray-500 uppercase">
              系统管理
            </p>
            {adminMenuItems.map(renderMenuItem)}
          </div>
        </nav>

        {/* 用户信息 */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center mb-3">
            <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
              <span className="text-blue-600 dark:text-blue-400 font-medium">
                {admin?.nickname?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                {admin?.nickname || '管理员'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{admin?.role_text}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
          >
            退出登录
          </button>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 overflow-auto">
        <div className="p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
