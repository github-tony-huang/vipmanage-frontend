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
    const map: Record<number, { cls: string; text: string }> = {
      1: { cls: 'badge badge-success', text: '充值' },
      2: { cls: 'badge badge-danger', text: '消费' },
      3: { cls: 'badge badge-warning', text: '退款' },
    };
    const item = map[type] || map[1];
    return <span className={item.cls}><span className="dot"></span>{item.text}</span>;
  };

  return (
    <div className="space-y-5">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">交易记录</h1>
          <p className="page-desc">共 {total} 笔交易</p>
        </div>
        <button onClick={() => setShowRechargeModal(true)} className="btn btn-success">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          充值
        </button>
      </div>

      {/* 交易列表 */}
      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>会员</th>
              <th>类型</th>
              <th>金额</th>
              <th>备注</th>
              <th>时间</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={5} className="!py-16 text-center text-gray-400">加载中...</td></tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={5} className="!py-16 text-center text-gray-400">
                  <svg className="w-10 h-10 mx-auto mb-2 empty-icon" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M9 8h6m-5 0a3 3 0 110 6H9l3 3m-3-6h6m6 1a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                  暂无交易记录
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="font-medium">{tx.member?.name || '-'}</td>
                  <td>{getTypeBadge(tx.tx_type)}</td>
                  <td className={`font-semibold ${tx.tx_type === 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {tx.tx_type === 1 ? '+' : '-'}¥{tx.amount}
                  </td>
                  <td className="text-gray-500 dark:text-gray-400">{tx.remark || '-'}</td>
                  <td className="text-gray-500 dark:text-gray-400 text-[13px]">{tx.created_at}</td>
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

      {/* 充值弹窗 */}
      {showRechargeModal && (
        <div className="modal-mask" onClick={() => setShowRechargeModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[#1a2233] dark:text-white mb-5">会员充值</h2>
            <div className="space-y-4">
              <div>
                <label className="label">会员 ID <span className="text-red-500">*</span></label>
                <input type="number" value={rechargeData.member_id || ''} onChange={(e) => setRechargeData({ ...rechargeData, member_id: Number(e.target.value) })} className="input" placeholder="请输入会员 ID" />
              </div>
              <div>
                <label className="label">充值金额（元） <span className="text-red-500">*</span></label>
                <input type="number" step="0.01" value={rechargeData.amount || ''} onChange={(e) => setRechargeData({ ...rechargeData, amount: Number(e.target.value) })} className="input" placeholder="0.00" />
              </div>
              <div>
                <label className="label">备注</label>
                <input type="text" value={rechargeData.remark} onChange={(e) => setRechargeData({ ...rechargeData, remark: e.target.value })} className="input" placeholder="选填" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowRechargeModal(false)} className="btn btn-secondary">取消</button>
              <button onClick={handleRecharge} className="btn btn-success">确认充值</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
