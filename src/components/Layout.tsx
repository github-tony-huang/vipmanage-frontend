import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../stores/auth';
import { logout as logoutApi } from '../api/admin';

interface MenuItem {
  path: string;
  label: string;
  icon: React.ReactNode;
  module?: string; // 权限模块，不设=所有人可见
}

const iconProps = { fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, viewBox: '0 0 24 24' } as const;

const menuItems: MenuItem[] = [
  {
    path: '/dashboard', label: '首页', icon: (
      <svg {...iconProps} width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"/></svg>
    ),
  },
  {
    path: '/members', label: '会员管理', module: 'member', icon: (
      <svg {...iconProps} width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/></svg>
    ),
  },
  {
    path: '/card-types', label: '卡种管理', module: 'cardtype', icon: (
      <svg {...iconProps} width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/></svg>
    ),
  },
  {
    path: '/member-cards', label: '会员卡管理', module: 'card', icon: (
      <svg {...iconProps} width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z"/></svg>
    ),
  },
  {
    path: '/signs', label: '签到记录', module: 'sign', icon: (
      <svg {...iconProps} width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
    ),
  },
  {
    path: '/transactions', label: '交易记录', module: 'transaction', icon: (
      <svg {...iconProps} width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>
    ),
  },
];

const adminMenuItems: MenuItem[] = [
  {
    path: '/admin/online', label: '在线管理', module: 'admin', icon: (
      <svg {...iconProps} width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M5.636 18.364a9 9 0 010-12.728m12.728 0a9 9 0 010 12.728m-9.9-2.829a5 5 0 010-7.07m7.072 0a5 5 0 010 7.07M13 12a1 1 0 11-2 0 1 1 0 012 0z"/></svg>
    ),
  },
  {
    path: '/admin/staff', label: '员工管理', module: 'admin', icon: (
      <svg {...iconProps} width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>
    ),
  },
  {
    path: '/admin/roles', label: '角色权限', module: 'admin', icon: (
      <svg {...iconProps} width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/></svg>
    ),
  },
  {
    path: '/admin/logs', label: '操作日志', module: 'admin', icon: (
      <svg {...iconProps} width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>
    ),
  },
  {
    path: '/admin/settings', label: '系统设置', module: 'admin', icon: (
      <svg {...iconProps} width="18" height="18"><path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
    ),
  },
];

// 检查用户是否有权限访问该菜单
function hasMenuPermission(permissions: string[], module?: string): boolean {
  if (!module) return true; // 无模块限制的菜单（如首页）始终可见
  if (permissions.includes('*')) return true; // 超管
  return permissions.some((p) => p.startsWith(module + ':'));
}

// 页面标题映射
const pageTitles: Record<string, string> = {
  '/dashboard': '数据概览',
  '/members': '会员管理',
  '/card-types': '卡种管理',
  '/member-cards': '会员卡管理',
  '/signs': '签到记录',
  '/transactions': '交易记录',
  '/admin/online': '在线管理',
  '/admin/staff': '员工管理',
  '/admin/roles': '角色权限',
  '/admin/logs': '操作日志',
  '/admin/settings': '系统设置',
};

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { admin, logout } = useAuthStore();
  const permissions = admin?.permissions || [];

  const visibleMenuItems = menuItems.filter((item) => hasMenuPermission(permissions, item.module));
  const visibleAdminItems = adminMenuItems.filter((item) => hasMenuPermission(permissions, item.module));

  const handleLogout = async () => {
    try {
      await logoutApi();
    } catch {
      // 忽略登出接口错误，本地照常清理
    }
    logout();
    window.location.href = '/login';
  };

  // 计算当前页标题
  const currentTitle =
    pageTitles[location.pathname] ||
    (location.pathname.startsWith('/members/') ? '会员详情' : '数据概览');

  const renderMenuItem = (item: MenuItem) => {
    const isActive = location.pathname === item.path ||
      (item.path !== '/dashboard' && location.pathname.startsWith(item.path));
    return (
      <Link
        key={item.path}
        to={item.path}
        className={`group relative flex items-center gap-[11px] px-3 py-[9px] mb-0.5 rounded-[9px] text-sm transition-all duration-150 ${
          isActive
            ? 'bg-[#eef1ff] dark:bg-[#3b5bfd]/15 text-[#3b5bfd] dark:text-blue-400 font-medium'
            : 'text-[#4a5568] dark:text-gray-400 hover:bg-[#f0f2f5] dark:hover:bg-gray-700/50 hover:text-[#1a2233] dark:hover:text-gray-200'
        }`}
      >
        {/* 激活竖条 */}
        {isActive && (
          <span className="absolute left-[-12px] top-1/2 -translate-y-1/2 w-[3px] h-[18px] bg-[#3b5bfd] rounded-r-full" />
        )}
        <span className={`flex-shrink-0 transition-colors ${
          isActive
            ? 'text-[#3b5bfd] dark:text-blue-400'
            : 'text-[#94a3b8] dark:text-gray-500 group-hover:text-[#4a5568] dark:group-hover:text-gray-300'
        }`}>
          {item.icon}
        </span>
        {item.label}
      </Link>
    );
  };

  return (
    <div className="min-h-screen flex bg-[#f7f8fa] dark:bg-gray-900">
      {/* 侧边栏 */}
      <aside className="w-[232px] flex-shrink-0 bg-[#fbfcfd] dark:bg-gray-800 border-r border-[#e8ecf1] dark:border-gray-700/60 flex flex-col sticky top-0 h-screen">
        {/* Logo */}
        <div className="h-16 flex items-center gap-[11px] px-5 border-b border-[#e8ecf1] dark:border-gray-700/60 flex-shrink-0">
          <div className="w-8 h-8 bg-gradient-to-br from-[#3b5bfd] to-[#6a4dff] rounded-[9px] flex items-center justify-center flex-shrink-0 shadow-[0_4px_10px_rgb(59_91_253/0.3)]">
            <span className="text-white text-sm font-bold">会</span>
          </div>
          <h1 className="text-[15px] font-semibold text-[#1a2233] dark:text-white tracking-tight">
            会员管理系统
          </h1>
        </div>

        {/* 菜单 */}
        <nav className="flex-1 overflow-y-auto py-4 px-3">
          {visibleMenuItems.map(renderMenuItem)}

          {visibleAdminItems.length > 0 && (
            <div className="pt-2">
              <p className="px-3 pt-4 pb-2 text-[11px] font-semibold text-[#94a3b8] dark:text-gray-500 uppercase tracking-[0.08em]">
                系统管理
              </p>
              {visibleAdminItems.map(renderMenuItem)}
            </div>
          )}
        </nav>

        {/* 用户信息 */}
        <div className="p-3 border-t border-[#e8ecf1] dark:border-gray-700/60 flex-shrink-0">
          <div className="flex items-center gap-[11px] px-2.5 py-2 rounded-[9px]">
            <div className="w-9 h-9 bg-gradient-to-br from-[#3b5bfd] to-[#6a4dff] rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">
                {admin?.nickname?.charAt(0) || 'A'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-[13.5px] font-semibold text-[#1a2233] dark:text-gray-100 truncate">
                {admin?.nickname || '管理员'}
              </p>
              <p className="text-xs text-[#94a3b8] dark:text-gray-500">{admin?.role_text}</p>
            </div>
            <button
              onClick={handleLogout}
              title="退出登录"
              className="p-[7px] text-[#94a3b8] hover:text-red-500 dark:hover:text-red-400 rounded-[7px] hover:bg-[#feeeee] dark:hover:bg-red-900/20 transition-colors"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>

      {/* 主内容 */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* 顶栏 */}
        <div className="h-16 bg-white dark:bg-gray-800 border-b border-[#e8ecf1] dark:border-gray-700/60 flex items-center justify-between px-7 sticky top-0 z-10 flex-shrink-0">
          <div className="text-[17px] font-semibold text-[#1a2233] dark:text-white">{currentTitle}</div>
          <div className="flex items-center gap-3">
            <button className="relative w-[38px] h-[38px] rounded-[9px] border border-[#e8ecf1] dark:border-gray-600 bg-white dark:bg-gray-700 text-[#4a5568] dark:text-gray-300 flex items-center justify-center hover:border-[#3b5bfd] hover:text-[#3b5bfd] dark:hover:text-blue-400 transition-colors" title="通知">
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
              </svg>
              <span className="absolute top-2 right-2.5 w-[7px] h-[7px] bg-red-500 rounded-full border-[1.5px] border-white dark:border-gray-700" />
            </button>
            <button
              onClick={() => navigate('/admin/roles')}
              className="w-[38px] h-[38px] rounded-[9px] border border-[#e8ecf1] dark:border-gray-600 bg-white dark:bg-gray-700 text-[#4a5568] dark:text-gray-300 flex items-center justify-center hover:border-[#3b5bfd] hover:text-[#3b5bfd] dark:hover:text-blue-400 transition-colors"
              title="设置"
            >
              <svg width="18" height="18" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </button>
          </div>
        </div>

        {/* 内容区 */}
        <main className="flex-1 overflow-auto">
          <div className="p-7 max-w-[1280px]">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
}
