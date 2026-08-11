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
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">签到管理</h1>

      {/* 签到表单 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">快速签到</h2>
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="输入会员卡号"
            value={cardNo}
            onChange={(e) => setCardNo(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSign()}
            className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-lg"
          />
          <button
            onClick={handleSign}
            disabled={signing}
            className="px-8 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
          >
            {signing ? '签到中...' : '签到'}
          </button>
        </div>

        {signError && (
          <div className="mt-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-lg">
            {signError}
          </div>
        )}

        {signResult && (
          <div className="mt-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-lg">
            <p className="font-medium">签到成功！</p>
            <p>会员：{signResult.member_name}</p>
            <p>卡号：{signResult.card_no}</p>
            <p>卡种：{signResult.card_type_name}</p>
            <p>
              剩余：{signResult.card_type === 1 ? `${signResult.remain_days}天` : `${signResult.remain_count}次`}
            </p>
          </div>
        )}
      </div>

      {/* 签到记录 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">签到记录</h2>
        </div>
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">会员</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">卡号</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">签到时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={3} className="px-6 py-12 text-center">加载中...</td></tr>
            ) : signs.length === 0 ? (
              <tr><td colSpan={3} className="px-6 py-12 text-center">暂无数据</td></tr>
            ) : (
              signs.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">{s.member?.name || '-'}</td>
                  <td className="px-6 py-4 font-mono text-sm">{s.member_card?.card_no || '-'}</td>
                  <td className="px-6 py-4 text-gray-500">{s.sign_time}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {total > pageSize && (
          <div className="px-6 py-4 flex justify-between items-center border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500">共 {total} 条记录</span>
            <div className="flex gap-2">
              <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-3 py-1 border rounded disabled:opacity-50">上一页</button>
              <button onClick={() => setPage(page + 1)} disabled={page * pageSize >= total} className="px-3 py-1 border rounded disabled:opacity-50">下一页</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
