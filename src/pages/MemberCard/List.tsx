import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMemberCardList, freezeMemberCard, unfreezeMemberCard, refundMemberCard, renewMemberCard, transferMemberCard } from '../../api/card';
import { getMemberList } from '../../api/member';
import type { MemberCard, MemberCardQuery, Member } from '../../types';
import { formatTime } from '../../utils/format';

export default function MemberCardList() {
  const [cards, setCards] = useState<MemberCard[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [searchMemberId, setSearchMemberId] = useState('');
  const [renewTarget, setRenewTarget] = useState<MemberCard | null>(null);
  const [renewDays, setRenewDays] = useState(30);
  const [transferTarget, setTransferTarget] = useState<MemberCard | null>(null);
  const [transferSearchKey, setTransferSearchKey] = useState('');
  const [transferResults, setTransferResults] = useState<Member[]>([]);
  const [transferSelected, setTransferSelected] = useState<Member | null>(null);
  const [transferSearching, setTransferSearching] = useState(false);

  useEffect(() => {
    fetchCards();
  }, [page, searchMemberId]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const params: MemberCardQuery = { page, page_size: pageSize };
      if (searchMemberId) params.member_id = Number(searchMemberId);
      const response = await getMemberCardList(params);
      setCards(response.data.data.list);
      setTotal(response.data.data.total);
    } catch (err) {
      console.error('获取会员卡列表失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFreeze = async (id: number) => {
    try { await freezeMemberCard(id); fetchCards(); } catch (err: any) { alert(err.message || '操作失败'); }
  };
  const handleUnfreeze = async (id: number) => {
    try { await unfreezeMemberCard(id); fetchCards(); } catch (err: any) { alert(err.message || '操作失败'); }
  };
  const handleRefund = async (id: number) => {
    if (!confirm('确定要退卡吗？')) return;
    try { await refundMemberCard(id, '管理员操作退卡'); fetchCards(); } catch (err: any) { alert(err.message || '操作失败'); }
  };

  const handleRenew = async () => {
    if (!renewTarget) return;
    try {
      await renewMemberCard(renewTarget.id, renewDays);
      setRenewTarget(null);
      setRenewDays(30);
      fetchCards();
    } catch (err: any) {
      alert(err.message || '续卡失败');
    }
  };

  const searchTransferMembers = async () => {
    if (!transferSearchKey.trim()) return;
    setTransferSearching(true);
    try {
      const resp = await getMemberList({ page: 1, page_size: 10, name: transferSearchKey.trim() });
      setTransferResults(resp.data.data.list || []);
    } catch {
      setTransferResults([]);
    } finally {
      setTransferSearching(false);
    }
  };

  const handleTransfer = async () => {
    if (!transferTarget || !transferSelected) return;
    try {
      await transferMemberCard(transferTarget.id, transferSelected.id);
      setTransferTarget(null);
      setTransferSearchKey('');
      setTransferResults([]);
      setTransferSelected(null);
      fetchCards();
    } catch (err: any) {
      alert(err.message || '转卡失败');
    }
  };

  const getStatusBadge = (status: number) => {
    const map: Record<number, { cls: string; text: string }> = {
      1: { cls: 'badge badge-success', text: '正常' },
      2: { cls: 'badge badge-danger', text: '冻结' },
      3: { cls: 'badge badge-warning', text: '已用完' },
      4: { cls: 'badge badge-warning', text: '已过期' },
      5: { cls: 'badge badge-muted', text: '已退卡' },
    };
    const item = map[status] || map[1];
    return <span className={item.cls}><span className="dot"></span>{item.text}</span>;
  };

  return (
    <div className="space-y-5">
      {/* 页头 */}
      <div>
        <h1 className="page-title">会员卡管理</h1>
        <p className="page-desc">共 {total} 张会员卡</p>
      </div>

      {/* 搜索栏 */}
      <div className="card p-4">
        <div className="relative max-w-xs">
          <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          <input
            type="text"
            placeholder="按会员 ID 筛选"
            value={searchMemberId}
            onChange={(e) => { setSearchMemberId(e.target.value); setPage(1); }}
            className="input pl-9"
          />
        </div>
      </div>

      {/* 会员卡列表 */}
      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>卡号</th>
              <th>会员</th>
              <th>卡种</th>
              <th>剩余</th>
              <th>过期日期</th>
              <th>状态</th>
              <th className="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={7} className="!py-16 text-center text-gray-400">加载中...</td></tr>
            ) : cards.length === 0 ? (
              <tr>
                <td colSpan={7} className="!py-16 text-center text-gray-400">
                  <svg className="w-10 h-10 mx-auto mb-2 empty-icon" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
                  暂无会员卡
                </td>
              </tr>
            ) : (
              cards.map((card) => (
                <tr key={card.id}>
                  <td className="font-mono text-[13px] font-medium text-gray-900 dark:text-white">{card.card_no}</td>
                  <td>
                    {card.member ? (
                      <Link to={`/members/${card.member.id}`} className="link-btn">{card.member.name}</Link>
                    ) : '-'}
                  </td>
                  <td className="text-gray-600 dark:text-gray-300">{card.card_type_info?.name || '-'}</td>
                  <td className="text-gray-600 dark:text-gray-300">
                    {card.card_type === 1 ? `${card.remain_days || 0} 天` : `${card.remain_count || 0} 次`}
                  </td>
                  <td className="text-gray-500 dark:text-gray-400 text-[13px]">{formatTime(card.expire_date)}</td>
                  <td>{getStatusBadge(card.status)}</td>
                  <td>
                    <div className="flex items-center justify-end gap-3">
                      {card.status === 1 && (
                        <>
                          <button onClick={() => handleFreeze(card.id)} className="link-btn warning">冻结</button>
                          <button onClick={() => handleRefund(card.id)} className="link-btn danger">退卡</button>
                        </>
                      )}
                      {card.status === 2 && (
                        <button onClick={() => handleUnfreeze(card.id)} className="link-btn success">解冻</button>
                      )}
                      {card.status !== 5 && (
                        <>
                          <button onClick={() => { setRenewTarget(card); setRenewDays(30); }} className="link-btn">续卡</button>
                          <button onClick={() => { setTransferTarget(card); setTransferSearchKey(''); setTransferResults([]); setTransferSelected(null); }} className="link-btn">转卡</button>
                        </>
                      )}
                    </div>
                  </td>
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

      {/* 续卡弹窗 */}
      {renewTarget && (
        <div className="modal-mask" onClick={() => setRenewTarget(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[#1a2233] dark:text-white mb-2">续卡</h2>
            <p className="text-sm text-[#94a3b8] mb-4">卡号 {renewTarget.card_no} · 当前到期 {renewTarget.expire_date ? formatTime(renewTarget.expire_date) : '无'}</p>
            <div>
              <label className="label">续期天数 <span className="text-red-500">*</span></label>
              <input type="number" value={renewDays} onChange={(e) => setRenewDays(Number(e.target.value))} className="input" min={1} />
              <div className="flex gap-2 mt-2">
                {[30, 90, 180, 365].map(d => (
                  <button key={d} onClick={() => setRenewDays(d)} className="btn btn-secondary btn-sm">{d}天</button>
                ))}
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setRenewTarget(null)} className="btn btn-secondary">取消</button>
              <button onClick={handleRenew} className="btn btn-primary">确认续卡</button>
            </div>
          </div>
        </div>
      )}

      {/* 转卡弹窗 */}
      {transferTarget && (
        <div className="modal-mask" onClick={() => setTransferTarget(null)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[#1a2233] dark:text-white mb-2">转卡</h2>
            <p className="text-sm text-[#94a3b8] mb-4">卡号 {transferTarget.card_no} · 当前会员 {transferTarget.member?.name || '-'}</p>
            <div>
              <label className="label">搜索目标会员 <span className="text-red-500">*</span></label>
              <div className="flex gap-2">
                <input type="text" value={transferSearchKey} onChange={(e) => setTransferSearchKey(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && searchTransferMembers()} className="input flex-1" placeholder="输入会员姓名搜索" />
                <button onClick={searchTransferMembers} className="btn btn-secondary">搜索</button>
              </div>
              {transferSearching && <p className="text-sm text-[#94a3b8] mt-2">搜索中...</p>}
              {transferResults.length > 0 && (
                <div className="mt-2 max-h-48 overflow-y-auto rounded-lg border border-[#e8ecf1] dark:border-gray-700">
                  {transferResults.map((m) => (
                    <div key={m.id} onClick={() => { setTransferSelected(m); setTransferResults([]); setTransferSearchKey(''); }} className="px-4 py-2.5 cursor-pointer hover:bg-[#f1f5f9] dark:hover:bg-gray-700/50 border-b border-[#e8ecf1] dark:border-gray-700/60 last:border-0 transition-colors">
                      <span className="font-medium text-[#1a2233] dark:text-white">{m.name}</span>
                      <span className="text-[#94a3b8] ml-3 text-[13px]">{m.phone}</span>
                      {m.status === 0 && <span className="text-red-400 ml-2 text-[12px]">已冻结</span>}
                    </div>
                  ))}
                </div>
              )}
              {transferSelected && (
                <div className="mt-3 px-4 py-2.5 rounded-lg bg-[#f0fdf4] dark:bg-green-900/20 border border-green-200 dark:border-green-700/40">
                  <span className="text-sm text-green-700 dark:text-green-300">已选择：{transferSelected.name}（{transferSelected.phone}）</span>
                  <button onClick={() => setTransferSelected(null)} className="ml-2 text-[#94a3b8] hover:text-red-400 text-[13px]">取消选择</button>
                </div>
              )}
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setTransferTarget(null)} className="btn btn-secondary">取消</button>
              <button onClick={handleTransfer} disabled={!transferSelected} className="btn btn-primary disabled:opacity-40 disabled:cursor-not-allowed">确认转卡</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
