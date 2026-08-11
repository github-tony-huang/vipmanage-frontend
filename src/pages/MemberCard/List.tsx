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
  const [searchCardNo] = useState('');
  const [searchMemberId, setSearchMemberId] = useState('');

  useEffect(() => {
    fetchCards();
  }, [page, searchCardNo, searchMemberId]);

  const fetchCards = async () => {
    setLoading(true);
    try {
      const params: MemberCardQuery = { page, page_size: pageSize };
      if (searchCardNo) {
        // 暂时不支持按卡号搜索，需要后端支持
      }
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
    try {
      await freezeMemberCard(id);
      fetchCards();
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const handleUnfreeze = async (id: number) => {
    try {
      await unfreezeMemberCard(id);
      fetchCards();
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const handleRefund = async (id: number) => {
    if (!confirm('确定要退卡吗？')) return;
    try {
      await refundMemberCard(id, '管理员操作退卡');
      fetchCards();
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const getStatusBadge = (status: number) => {
    const styles: Record<number, string> = {
      1: 'bg-green-100 text-green-700',
      2: 'bg-red-100 text-red-700',
      3: 'bg-orange-100 text-orange-700',
      4: 'bg-yellow-100 text-yellow-700',
      5: 'bg-gray-100 text-gray-700',
    };
    const texts: Record<number, string> = {
      1: '正常', 2: '冻结', 3: '已用完', 4: '已过期', 5: '已退卡'
    };
    return (
      <span className={`px-2 py-1 text-xs rounded-full ${styles[status] || ''}`}>
        {texts[status] || '未知'}
      </span>
    );
  };

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">会员卡管理</h1>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-4 mb-6">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="搜索会员ID"
            value={searchMemberId}
            onChange={(e) => { setSearchMemberId(e.target.value); setPage(1); }}
            className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
          />
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">卡号</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">会员</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">卡种</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">剩余</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">过期日期</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center">加载中...</td></tr>
            ) : cards.length === 0 ? (
              <tr><td colSpan={7} className="px-6 py-12 text-center">暂无数据</td></tr>
            ) : (
              cards.map((card) => (
                <tr key={card.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 font-mono text-sm">{card.card_no}</td>
                  <td className="px-6 py-4">
                    {card.member ? (
                      <Link to={`/members/${card.member.id}`} className="text-blue-600 hover:underline">
                        {card.member.name}
                      </Link>
                    ) : '-'}
                  </td>
                  <td className="px-6 py-4">{card.card_type_info?.name || '-'}</td>
                  <td className="px-6 py-4">
                    {card.card_type === 1 ? `${card.remain_days || 0}天` : `${card.remain_count || 0}次`}
                  </td>
                  <td className="px-6 py-4 text-gray-500">{card.expire_date || '-'}</td>
                  <td className="px-6 py-4">{getStatusBadge(card.status)}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    {card.status === 1 && (
                      <>
                        <button onClick={() => handleFreeze(card.id)} className="text-yellow-600 hover:text-yellow-800">冻结</button>
                        <button onClick={() => handleRefund(card.id)} className="text-red-600 hover:text-red-800">退卡</button>
                      </>
                    )}
                    {card.status === 2 && (
                      <button onClick={() => handleUnfreeze(card.id)} className="text-green-600 hover:text-green-800">解冻</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>

        {total > pageSize && (
          <div className="px-6 py-4 flex justify-between items-center border-t border-gray-200 dark:border-gray-700">
            <span className="text-sm text-gray-500">
              共 {total} 条记录，第 {page} / {Math.ceil(total / pageSize)} 页
            </span>
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
