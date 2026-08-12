import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMemberCardList, freezeMemberCard, unfreezeMemberCard, refundMemberCard } from '../../api/card';
import type { MemberCard, MemberCardQuery } from '../../types';

export default function MemberCardList() {
  const [cards, setCards] = useState<MemberCard[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [searchMemberId, setSearchMemberId] = useState('');

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
                  <td className="text-gray-500 dark:text-gray-400 text-[13px]">{card.expire_date || '-'}</td>
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
    </div>
  );
}
