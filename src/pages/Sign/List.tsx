import { useState, useEffect } from 'react';
import { sign as signApi, getSignList } from '../../api/sign';
import type { SignRecord, SignQuery } from '../../types';

export default function SignList() {
  const [signs, setSigns] = useState<SignRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [cardNo, setCardNo] = useState('');
  const [signResult, setSignResult] = useState<any>(null);
  const [signError, setSignError] = useState('');
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    fetchSigns();
  }, [page]);

  const fetchSigns = async () => {
    setLoading(true);
    try {
      const params: SignQuery = { page, page_size: pageSize };
      const response = await getSignList(params);
      setSigns(response.data.data.list);
      setTotal(response.data.data.total);
    } catch (err) {
      console.error('获取签到记录失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSign = async () => {
    if (!cardNo.trim()) {
      setSignError('请输入卡号');
      return;
    }
    setSigning(true);
    setSignError('');
    setSignResult(null);
    try {
      const response = await signApi({ card_no: cardNo });
      setSignResult(response.data.data);
      setCardNo('');
      fetchSigns();
    } catch (err: any) {
      setSignError(err.message || '签到失败');
    } finally {
      setSigning(false);
    }
  };

  return (
    <div className="space-y-5">
      {/* 页头 */}
      <div>
        <h1 className="page-title">签到管理</h1>
        <p className="page-desc">会员到店签到与记录查询</p>
      </div>

      {/* 快速签到 */}
      <div className="card p-6">
        <h2 className="text-[15.5px] font-semibold text-[#1a2233] dark:text-white mb-4">快速签到</h2>
        <div className="flex gap-3 max-w-xl">
          <div className="relative flex-1">
            <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" />
            </svg>
            <input
              type="text"
              placeholder="输入会员卡号，回车快速签到"
              value={cardNo}
              onChange={(e) => setCardNo(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSign()}
              className="input pl-11 h-11 text-base"
            />
          </div>
          <button onClick={handleSign} disabled={signing} className="btn btn-success h-11 px-8">
            {signing ? '签到中...' : '签到'}
          </button>
        </div>

        {signError && (
          <div className="mt-4 flex items-center gap-2 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded-lg text-sm">
            <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" /></svg>
            {signError}
          </div>
        )}

        {signResult && (
          <div className="mt-4 px-5 py-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg">
            <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold mb-2">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
              签到成功
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
              <div><span className="text-emerald-600/70 dark:text-emerald-500">会员</span><p className="font-medium text-emerald-800 dark:text-emerald-300">{signResult.member_name}</p></div>
              <div><span className="text-emerald-600/70 dark:text-emerald-500">卡号</span><p className="font-medium text-emerald-800 dark:text-emerald-300 font-mono">{signResult.card_no}</p></div>
              <div><span className="text-emerald-600/70 dark:text-emerald-500">卡种</span><p className="font-medium text-emerald-800 dark:text-emerald-300">{signResult.card_type_name}</p></div>
              <div><span className="text-emerald-600/70 dark:text-emerald-500">剩余</span><p className="font-medium text-emerald-800 dark:text-emerald-300">{signResult.card_type === 1 ? `${signResult.remain_days} 天` : `${signResult.remain_count} 次`}</p></div>
            </div>
          </div>
        )}
      </div>

      {/* 签到记录 */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e8ecf1] dark:border-gray-700/60">
          <h2 className="text-[15.5px] font-semibold text-[#1a2233] dark:text-white">签到记录</h2>
        </div>
        <table className="table">
          <thead>
            <tr>
              <th>会员</th>
              <th>卡号</th>
              <th>签到时间</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={3} className="!py-16 text-center text-gray-400">加载中...</td></tr>
            ) : signs.length === 0 ? (
              <tr>
                <td colSpan={3} className="!py-16 text-center text-gray-400">
                  <svg className="w-10 h-10 mx-auto mb-2 empty-icon" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" /></svg>
                  暂无签到记录
                </td>
              </tr>
            ) : (
              signs.map((s) => (
                <tr key={s.id}>
                  <td className="font-medium">{s.member?.name || '-'}</td>
                  <td className="font-mono text-[13px] text-gray-600 dark:text-gray-300">{s.member_card?.card_no || '-'}</td>
                  <td className="text-gray-500 dark:text-gray-400 text-[13px]">{s.sign_time}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {total > pageSize && (
          <div className="px-5 py-3.5 flex justify-between items-center border-t border-[#e8ecf1] dark:border-gray-700/60">
            <span className="text-[13px] text-gray-400">共 {total} 条 · 第 {page} / {Math.ceil(total / pageSize)} 页</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(page - 1)} disabled={page === 1} className="btn btn-secondary btn-sm">上一页</button>
              <button onClick={() => setPage(page + 1)} disabled={page * pageSize >= total} className="btn btn-secondary btn-sm">下一页</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
