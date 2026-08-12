import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { login as loginApi } from '../api/member';
import { useAuthStore } from '../stores/auth';

export default function Login() {
  const [username, setUsername] = useState('admin');
  const [password, setPassword] = useState('admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const { setAuth } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await loginApi({ username, password });
      const { access_token, refresh_token, admin } = response.data.data;
      setAuth(access_token, refresh_token, admin);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || '登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-[#f7f8fa] dark:bg-gray-900 px-4">
      {/* 背景装饰：克制的浅色光斑，只提亮不显脏 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -left-36 w-[520px] h-[520px] bg-[#dbe4ff] opacity-50 rounded-full blur-[100px]" />
        <div className="absolute -bottom-36 -right-32 w-[460px] h-[460px] bg-[#e4e0ff] opacity-50 rounded-full blur-[100px]" />
        <div className="absolute top-[30%] right-[15%] w-[300px] h-[300px] bg-[#dff0ff] opacity-40 rounded-full blur-[100px]" />
      </div>

      {/* 登录卡片 */}
      <div className="relative z-10 w-full max-w-[400px]">
        <div className="bg-white dark:bg-gray-800 rounded-[20px] border border-gray-200/80 dark:border-gray-700 shadow-[0_1px_2px_rgb(16_24_40/0.04),0_12px_40px_-12px_rgb(16_24_40/0.12),0_24px_64px_-16px_rgb(59_91_253/0.08)] px-10 py-11">
          {/* 品牌区 */}
          <div className="flex flex-col items-center text-center mb-8">
            <div className="w-[54px] h-[54px] bg-gradient-to-br from-[#3b5bfd] to-[#6a4dff] rounded-[15px] flex items-center justify-center shadow-[0_10px_24px_-8px_rgb(59_91_253/0.45)] mb-4">
              <span className="text-[23px] text-white font-bold">会</span>
            </div>
            <h1 className="text-[21px] font-bold text-gray-900 dark:text-white tracking-tight">会员管理系统</h1>
            <p className="text-[13px] text-gray-400 dark:text-gray-500 mt-1.5">小工作室的数字化管理助手</p>
          </div>

          {/* 表单 */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded-lg text-sm">
                <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                {error}
              </div>
            )}

            <div>
              <label className="block text-[13px] font-medium text-gray-600 dark:text-gray-300 mb-1.5">用户名</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[17px] h-[17px] text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full h-[46px] pl-[42px] pr-3.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-[1.5px] border-gray-200 dark:border-gray-600 rounded-[9px] outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 focus:border-[#3b5bfd] focus:shadow-[0_0_0_4px_rgb(59_91_253/0.1)]"
                  placeholder="请输入用户名"
                  autoComplete="username"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-gray-600 dark:text-gray-300 mb-1.5">密码</label>
              <div className="relative">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[17px] h-[17px] text-gray-400 pointer-events-none" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-[46px] pl-[42px] pr-3.5 text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-700 border-[1.5px] border-gray-200 dark:border-gray-600 rounded-[9px] outline-none transition-all placeholder:text-gray-400 hover:border-gray-300 dark:hover:border-gray-500 focus:border-[#3b5bfd] focus:shadow-[0_0_0_4px_rgb(59_91_253/0.1)]"
                  placeholder="请输入密码"
                  autoComplete="current-password"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full h-[46px] mt-2.5 bg-gradient-to-br from-[#3b5bfd] to-[#5a4dff] text-white text-[15px] font-semibold tracking-wide rounded-[9px] shadow-[0_6px_18px_-6px_rgb(59_91_253/0.4)] hover:shadow-[0_10px_26px_-6px_rgb(59_91_253/0.5)] hover:-translate-y-px active:translate-y-0 transition-all disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin w-4 h-4" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  登录中...
                </span>
              ) : '登 录'}
            </button>
          </form>

          {/* 测试账号 */}
          <div className="flex items-center gap-3.5 my-6">
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
            <span className="text-xs text-gray-400 dark:text-gray-500">测试账号</span>
            <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700" />
          </div>
          <div className="text-center text-xs text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-700/50 rounded-lg py-2.5">
            账号 <code className="font-mono text-[#3b5bfd] dark:text-blue-400 bg-[#eef1ff] dark:bg-blue-900/30 px-1.5 py-0.5 rounded font-semibold">admin</code>
            <span className="mx-1.5">·</span>
            密码 <code className="font-mono text-[#3b5bfd] dark:text-blue-400 bg-[#eef1ff] dark:bg-blue-900/30 px-1.5 py-0.5 rounded font-semibold">admin123</code>
          </div>
        </div>

        {/* 底部版权 */}
        <p className="text-center text-xs text-gray-400 dark:text-gray-500 mt-6">
          会员管理系统 © 2026 · 让小工作室管理更简单
        </p>
      </div>
    </div>
  );
}
