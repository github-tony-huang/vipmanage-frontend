import { useState, useEffect } from 'react';
import { getTransactionList, recharge, consume, refund } from '../../api/transaction';
import { getMemberList } from '../../api/member';
import { getMemberCardList } from '../../api/card';
import { exportTransactions } from '../../api/export';
import type { Transaction, TransactionQuery, Member, MemberCard } from '../../types';
import { formatTime } from '../../utils/format';
import { usePermission } from '../../hooks/usePermission';

type ModalType = 'recharge' | 'consume' | 'refund';

const modalConfig: Record<ModalType, { title: string; label: string; btn: string; btnCls: string; requireMember: boolean }> = {
  recharge: { title: '会员充值', label: '充值金额（元）', btn: '确认充值', btnCls: 'btn btn-success', requireMember: true },
  consume: { title: '消费扣款', label: '消费金额（元）', btn: '确认消费', btnCls: 'btn btn-primary', requireMember: false },
  refund: { title: '退款', label: '退款金额（元）', btn: '确认退款', btnCls: 'btn btn-warning', requireMember: false },
};

export default function TransactionList() {
  const { hasPermission } = usePermission();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [txType, setTxType] = useState<number | ''>('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 弹窗状态
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState<ModalType>('recharge');
  const [amount, setAmount] = useState(0);
  const [remark, setRemark] = useState('');
  const [searchKey, setSearchKey] = useState('');
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberCards, setMemberCards] = useState<MemberCard[]>([]);
  const [selectedCardId, setSelectedCardId] = useState(0);

  useEffect(() => {
    fetchTransactions();
  }, [page, txType, startDate, endDate]);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params: TransactionQuery = { page, page_size: pageSize };
      if (txType !== '') params.tx_type = txType;
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const response = await getTransactionList(params);
      setTransactions(response.data.data.list);
      setTotal(response.data.data.total);
    } catch (err) {
      console.error('获取交易记录失败', err);
    } finally {
      setLoading(false);
    }
  };

  const openModal = (type: ModalType) => {
    setModalType(type);
    setAmount(0);
    setRemark('');
    setSearchKey('');
    setSearchResults([]);
    setSelectedMember(null);
    setMemberCards([]);
    setSelectedCardId(0);
    setShowModal(true);
  };

  const handleSearch = async () => {
    if (!searchKey.trim()) return;
    setSearching(true);
    try {
      const key = searchKey.trim();
      const params: any = { page: 1, page_size: 10 };
      if (/^\d+$/.test(key)) params.phone = key; else params.name = key;
      const resp = await getMemberList(params);
      setSearchResults(resp.data.data.list || []);
    } catch {
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectMember = async (m: Member) => {
    setSelectedMember(m);
    setSearchResults([]);
    setSearchKey('');
    setSelectedCardId(0);
    try {
      const resp = await getMemberCardList({ page: 1, page_size: 50, member_id: m.id });
      setMemberCards(resp.data.data.list || []);
    } catch {
      setMemberCards([]);
    }
  };

  const handleSubmit = async () => {
    const cfg = modalConfig[modalType];
    if (cfg.requireMember && !selectedMember) { alert('请选择会员'); return; }
    if (!amount || amount <= 0) { alert('请输入金额'); return; }
    try {
      const data: any = { amount, remark };
      if (selectedMember) {
        data.member_id = selectedMember.id;
        if (selectedCardId) data.member_card_id = selectedCardId;
      }
      if (modalType === 'recharge') await recharge(data);
      else if (modalType === 'consume') await consume(data);
      else await refund(data);
      setShowModal(false);
      fetchTransactions();
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const handleExport = async () => {
    setExporting(true);
    try {
      await exportTransactions();
    } catch (err: any) {
      alert(err.message || '导出失败');
    } finally {
      setExporting(false);
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

  const cfg = modalConfig[modalType];

  return (
    <div className="space-y-5">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">交易记录</h1>
          <p className="page-desc">共 {total} 笔交易</p>
        </div>
        <div className="flex gap-3">
          <button onClick={fetchTransactions} disabled={loading} className="btn btn-secondary">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
            刷新
          </button>
          {hasPermission('transaction:export') && (
            <button onClick={handleExport} disabled={exporting} className="btn btn-secondary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
              {exporting ? '导出中...' : '导出'}
            </button>
          )}
          {hasPermission('transaction:consume') && (
            <button onClick={() => openModal('consume')} className="btn btn-primary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4" /></svg>
              消费
            </button>
          )}
          {hasPermission('transaction:refund') && (
            <button onClick={() => openModal('refund')} className="btn btn-secondary">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
              退款
            </button>
          )}
          {hasPermission('transaction:recharge') && (
            <button onClick={() => openModal('recharge')} className="btn btn-success">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
              充值
            </button>
          )}
        </div>
      </div>

      {/* 交易列表 */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e8ecf1] dark:border-gray-700/60 flex items-center gap-3 flex-wrap">
          <select value={txType} onChange={(e) => { setTxType(e.target.value === '' ? '' : Number(e.target.value)); setPage(1); }} className="input !h-9 !w-auto text-[13px]">
            <option value="">全部类型</option>
            <option value={1}>充值</option>
            <option value={2}>消费</option>
            <option value={3}>退款</option>
          </select>
          <div className="flex items-center gap-2">
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="input !h-9 !w-auto text-[13px]" />
            <span className="text-[#94a3b8] text-sm">至</span>
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="input !h-9 !w-auto text-[13px]" />
          </div>
          {(txType !== '' || startDate || endDate) && (
            <button onClick={() => { setTxType(''); setStartDate(''); setEndDate(''); setPage(1); }} className="link-btn">清除筛选</button>
          )}
        </div>
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
                  <td className="font-medium">{tx.member?.name || '散客'}</td>
                  <td>{getTypeBadge(tx.tx_type)}</td>
                  <td className={`font-semibold ${tx.tx_type === 1 ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'}`}>
                    {tx.tx_type === 1 ? '+' : '-'}¥{tx.amount}
                  </td>
                  <td className="text-gray-500 dark:text-gray-400">{tx.remark || '-'}</td>
                  <td className="text-gray-500 dark:text-gray-400 text-[13px]">{formatTime(tx.created_at)}</td>
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

      {/* 通用弹窗 */}
      {showModal && (
        <div className="modal-mask" onClick={() => setShowModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[#1a2233] dark:text-white mb-5">{cfg.title}</h2>
            <div className="space-y-4">
              {/* 会员搜索 */}
              <div>
                <label className="label">
                  会员 {cfg.requireMember && <span className="text-red-500">*</span>}
                  {!cfg.requireMember && <span className="text-[#94a3b8] text-[12px] ml-1">（散客可不选）</span>}
                </label>
                {selectedMember ? (
                  <div className="px-4 py-2.5 rounded-lg bg-[#f0fdf4] dark:bg-green-900/20 border border-green-200 dark:border-green-700/40 flex items-center justify-between">
                    <span className="text-sm text-green-700 dark:text-green-300">{selectedMember.name}（{selectedMember.phone}）</span>
                    <button onClick={() => { setSelectedMember(null); setMemberCards([]); setSelectedCardId(0); }} className="text-[#94a3b8] hover:text-red-400 text-[13px]">取消选择</button>
                  </div>
                ) : (
                  <>
                    <div className="flex gap-2">
                      <input type="text" value={searchKey} onChange={(e) => setSearchKey(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="input flex-1" placeholder="输入姓名或手机号搜索" />
                      <button onClick={handleSearch} disabled={searching} className="btn btn-secondary">{searching ? '...' : '搜索'}</button>
                    </div>
                    {searchResults.length > 0 && (
                      <div className="mt-2 max-h-40 overflow-y-auto rounded-lg border border-[#e8ecf1] dark:border-gray-700">
                        {searchResults.map((m) => (
                          <div key={m.id} onClick={() => handleSelectMember(m)} className="px-4 py-2.5 cursor-pointer hover:bg-[#f1f5f9] dark:hover:bg-gray-700/50 border-b border-[#e8ecf1] dark:border-gray-700/60 last:border-0">
                            <span className="font-medium text-[#1a2233] dark:text-white">{m.name}</span>
                            <span className="text-[#94a3b8] ml-3 text-[13px]">{m.phone}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* 会员卡选择（选了会员才显示） */}
              {selectedMember && memberCards.length > 0 && (
                <div>
                  <label className="label">关联会员卡 <span className="text-[#94a3b8] text-[12px] ml-1">（可选）</span></label>
                  <select value={selectedCardId} onChange={(e) => setSelectedCardId(Number(e.target.value))} className="input">
                    <option value={0}>不关联</option>
                    {memberCards.map((c) => (
                      <option key={c.id} value={c.id}>{c.card_type_info?.name || '卡'} - {c.card_no}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* 金额 */}
              <div>
                <label className="label">{cfg.label} <span className="text-red-500">*</span></label>
                <input type="number" step="0.01" value={amount || ''} onChange={(e) => setAmount(Number(e.target.value))} className="input" placeholder="0.00" />
              </div>

              {/* 备注 */}
              <div>
                <label className="label">备注</label>
                <input type="text" value={remark} onChange={(e) => setRemark(e.target.value)} className="input" placeholder="选填" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowModal(false)} className="btn btn-secondary">取消</button>
              <button onClick={handleSubmit} className={cfg.btnCls}>{cfg.btn}</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
