import { useState, useEffect } from 'react';
import { getTransactionList, recharge } from '../../api/transaction';
import type { Transaction, TransactionQuery } from '../../types';

export default function TransactionList() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [showRechargeModal, setShowRechargeModal] = useState(false);
  const [rechargeData, setRechargeData] = useState({ member_id: 0, amount: 0, remark: '' });

  useEffect(() => {
    fetchTransactions();
  }, [page]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params: TransactionQuery = { page, page_size: pageSize };
      const response = await getTransactionList(params);
      setTransactions(response.data.data.list);
      setTotal(response.data.data.total);
    } catch (err) {
      console.error('获取交易记录失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRecharge = async () => {
    try {
      await recharge(rechargeData);
      setShowRechargeModal(false);
      setRechargeData({ member_id: 0, amount: 0, remark: '' });
      fetchTransactions();
    } catch (err: any) {
      alert(err.message || '充值失败');
    }
  };

  const getTypeBadge = (type: number) => {
    const styles: Record<number, string> = {
      1: 'bg-green-100 text-green-700',
      2: 'bg-red-100 text-red-700',
      3: 'bg-orange-100 text-orange-700',
    };
    const texts: Record<number, string> = {
      1: '充值', 2: '消费', 3: '退款'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[type] || ''}`}>
        {texts[type] || '未知'}
      </span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">交易记录</h1>
        <button
          onClick={() => setShowRechargeModal(true)}
          className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg"
        >
          充值
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">会员</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">金额</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">备注</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">时间</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center">加载中...</td></tr>
            ) : transactions.length === 0 ? (
              <tr><td colSpan={5} className="px-6 py-12 text-center">暂无数据</td></tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4">{tx.member?.name || '-'}</td>
                  <td className="px-6 py-4">{getTypeBadge(tx.tx_type)}</td>
                  <td className={`px-6 py-4 font-medium ${tx.tx_type === 1 ? 'text-green-600' : 'text-red-600'}`}>
                    {tx.tx_type === 1 ? '+' : '-'}{tx.amount}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{tx.remark || '-'}</td>
                  <td className="px-6 py-4 text-gray-500">{tx.created_at}</td>
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

      {showRechargeModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">会员充值</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">会员ID</label>
                <input
                  type="number"
                  value={rechargeData.member_id}
                  onChange={(e) => setRechargeData({ ...rechargeData, member_id: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">充值金额</label>
                <input
                  type="number"
                  step="0.01"
                  value={rechargeData.amount}
                  onChange={(e) => setRechargeData({ ...rechargeData, amount: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">备注</label>
                <input
                  type="text"
                  value={rechargeData.remark}
                  onChange={(e) => setRechargeData({ ...rechargeData, remark: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowRechargeModal(false)} className="px-4 py-2 border rounded-lg">取消</button>
              <button onClick={handleRecharge} className="px-4 py-2 bg-green-600 text-white rounded-lg">确认充值</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
