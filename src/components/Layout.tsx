import { Outlet, Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { logout as logoutApi } from '../api/admin';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const iconProps = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.7, viewBox: '0 0 24 24' } as const;
const iconCls = 'w-[18px] h-[18px]';

const menuItems: MenuItem[] = [
  {
    path: '/dashboard', label: '首页', icon: (
      <svg {...iconProps} className={iconCls}><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" /></svg>
    ),
  },
  {
    path: '/members', label: '会员管理', icon: (
      <svg {...iconProps} className={iconCls}><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
    ),
  },
  {
    path: '/card-types', label: '卡种管理', icon: (
      <svg {...iconProps} className={iconCls}><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
    ),
  },
  {
    path: '/member-cards', label: '会员卡管理', icon: (
      <svg {...iconProps} className={iconCls}><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
    ),
  },
  {
    path: '/signs', label: '签到记录', icon: (
      <svg {...iconProps} className={iconCls}><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>
    ),
  },
  {
    path: '/transactions', label: '交易记录', icon: (
      <svg {...iconProps} className={iconCls}><path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
    ),
  },
];

const adminMenuItems: MenuItem[] = [
  {
    path: '/admin/online', label: '在线管理', icon: (
      <svg {...iconProps} className={iconCls}><path strokeLinecap="round" strokeLinejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z" /></svg>
    ),
  },
  {
    path: '/admin/roles', label: '角色权限', icon: (
      <svg {...iconProps} className={iconCls}><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
    ),
  },
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

  const renderMenuItem = (item: MenuItem) => {
    const isActive = location.pathname === item.path ||
      (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
    return (
      <Link
        key={item.path}
        to={item.path}
        className={`group flex items-center gap-3 px-3 py-2.5 rounded-lg text-[14px] transition-all duration-150 ${
          isActive
            ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 font-medium'
            : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700/50 hover:text-gray-900 dark:hover:text-gray-200'
        }`}
      >
        <span className={`flex-shrink-0 transition-colors ${isActive ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500 group-hover:text-gray-600 dark:group-hover:text-gray-300'}`}>
          {item.icon}
        </span>
        {item.label}
        {isActive && (
          <span className="ml-auto w-1.5 h-1.5 rounded-full bg-blue-600 dark:bg-blue-400" />
        )}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#f1f5f9] dark:bg-gray-900">
      {/* 侧边栏 */}
      <aside className="w-[240px] flex-shrink-0 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700/60 flex flex-col">
        {/* Logo */}
        <div className="h-16 flex items-center gap-2.5 px-5 border-b border-gray-100 dark:border-gray-700/60">
          <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <span className="text-white text-sm font-bold">会</span>
          </div>
          <h1 className="text-[15px] font-semibold text-gray-900 dark:text-white tracking-tight">
            会员管理系统
          </h1>
        </div>

        {/* 菜单 */}
        <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
          {menuItems.map(renderMenuItem)}

          {/* 系统管理分组 */}
          <div className="pt-5">
            <p className="px-3 pb-2 text-[11px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">
              系统管理
            </p>
            <div className="space-y-1">
              {adminMenuItems.map(renderMenuItem)}
            </div>
          </div>
        </nav>

        {/* 用户信息 */}
        <div className="p-3 border-t border-gray-100 dark:border-gray-700/60">
          <div className="flex items-center gap-3 px-2 py-2 rounded-lg">
            <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-medium">
                {admin?.nickname?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                {admin?.nickname || '管理员'}
              </p>
              <p className="text-xs text-gray-400 dark:text-gray-500">{admin?.role_text}</p>
            </div>
            <button
              onClick={handleLogout}
              title="退出登录"
              className="p-1.5 text-gray-400 hover:text-red-500 dark:hover:text-red-400 rounded-md hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
            >
              <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={1.7} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* 主内容区 */}
      <main className="flex-1 min-w-0 overflow-auto">
        <div className="p-6 max-w-[1400px] mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
