import { useState, useEffect } from 'react';
import { sign as signApi, getSignList } from '../../api/sign';
import { getMemberList } from '../../api/member';
import { getMemberCardList } from '../../api/card';
import type { SignRecord, SignQuery, Member, MemberCard } from '../../types';
import { formatTime } from '../../utils/format';

export default function SignList() {
  const [signs, setSigns] = useState<SignRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [loading, setLoading] = useState(false);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // 签到相关状态
  const [searchKey, setSearchKey] = useState('');
  const [searchResults, setSearchResults] = useState<Member[]>([]);
  const [searching, setSearching] = useState(false);
  const [selectedMember, setSelectedMember] = useState<Member | null>(null);
  const [memberCards, setMemberCards] = useState<MemberCard[]>([]);
  const [selectedCard, setSelectedCard] = useState<MemberCard | null>(null);
  const [signResult, setSignResult] = useState<any>(null);
  const [signError, setSignError] = useState('');
  const [signing, setSigning] = useState(false);

  useEffect(() => {
    fetchSigns();
  }, [page, startDate, endDate]);

  const fetchSigns = async () => {
    setLoading(true);
    try {
      const params: SignQuery = { page, page_size: pageSize };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;
      const response = await getSignList(params);
      setSigns(response.data.data.list);
      setTotal(response.data.data.total);
    } catch (err) {
      console.error('获取签到记录失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = async () => {
    if (!searchKey.trim()) return;
    setSearching(true);
    setSignError('');
    setSignResult(null);
    try {
      const key = searchKey.trim();
      const params: any = { page: 1, page_size: 10 };
      if (/^\d+$/.test(key)) {
        params.phone = key;
      } else {
        params.name = key;
      }
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
    setSelectedCard(null);
    // 获取该会员的有效卡
    try {
      const resp = await getMemberCardList({ page: 1, page_size: 50, member_id: m.id, status: 1 });
      setMemberCards(resp.data.data.list || []);
    } catch {
      setMemberCards([]);
    }
  };

  const handleSign = async () => {
    if (!selectedCard) {
      setSignError('请选择一张会员卡');
      return;
    }
    setSigning(true);
    setSignError('');
    setSignResult(null);
    try {
      const response = await signApi({ card_id: selectedCard.id });
      setSignResult(response.data.data);
      // 重置选择
      setSelectedMember(null);
      setSelectedCard(null);
      setMemberCards([]);
      fetchSigns();
    } catch (err: any) {
      setSignError(err.message || '签到失败');
    } finally {
      setSigning(false);
    }
  };

  const resetSign = () => {
    setSearchKey('');
    setSearchResults([]);
    setSelectedMember(null);
    setMemberCards([]);
    setSelectedCard(null);
    setSignResult(null);
    setSignError('');
  };

  return (
    <div className="space-y-5">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">签到管理</h1>
          <p className="page-desc">会员到店签到与记录查询</p>
        </div>
        <button onClick={fetchSigns} disabled={loading} className="btn btn-secondary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
          刷新
        </button>
      </div>

      {/* 快速签到 */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[15.5px] font-semibold text-[#1a2233] dark:text-white">快速签到</h2>
          {(selectedMember || signResult || signError) && (
            <button onClick={resetSign} className="link-btn">重新签到</button>
          )}
        </div>

        {/* 步骤1：搜索会员 */}
        {!selectedMember && !signResult && (
          <div className="max-w-xl">
            <label className="label">搜索会员</label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 w-[18px] h-[18px] text-gray-400" fill="none" stroke="currentColor" strokeWidth={1.8} viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
                <input type="text" value={searchKey} onChange={(e) => setSearchKey(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearch()} className="input pl-11 h-11" placeholder="输入姓名或手机号搜索" />
              </div>
              <button onClick={handleSearch} disabled={searching} className="btn btn-secondary h-11 px-6">{searching ? '搜索中...' : '搜索'}</button>
            </div>
            {searchResults.length > 0 && (
              <div className="mt-2 max-h-56 overflow-y-auto rounded-lg border border-[#e8ecf1] dark:border-gray-700">
                {searchResults.map((m) => (
                  <div key={m.id} onClick={() => handleSelectMember(m)} className="px-4 py-3 cursor-pointer hover:bg-[#f1f5f9] dark:hover:bg-gray-700/50 border-b border-[#e8ecf1] dark:border-gray-700/60 last:border-0 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-[#1a2233] dark:text-white">{m.name}</span>
                        <span className="text-[#94a3b8] text-[13px]">{m.phone}</span>
                        <span className="text-[#94a3b8] text-[12px]">{m.gender === 1 ? '男' : m.gender === 2 ? '女' : ''}</span>
                      </div>
                      <span className="text-[#94a3b8] text-[12px] font-mono">ID:{m.id}</span>
                    </div>
                    {m.created_at && <div className="text-[#94a3b8] text-[12px] mt-1">注册时间：{formatTime(m.created_at)}</div>}
                  </div>
                ))}
              </div>
            )}
            {signError && (
              <div className="mt-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded-lg text-sm">{signError}</div>
            )}
          </div>
        )}

        {/* 步骤2：选择会员卡 */}
        {selectedMember && !signResult && (
          <div className="max-w-xl">
            <div className="px-4 py-2.5 rounded-lg bg-[#f0fdf4] dark:bg-green-900/20 border border-green-200 dark:border-green-700/40 mb-4">
              <span className="text-sm text-green-700 dark:text-green-300">已选择会员：{selectedMember.name}（{selectedMember.phone}）</span>
              <button onClick={() => { setSelectedMember(null); setMemberCards([]); }} className="ml-2 text-[#94a3b8] hover:text-red-400 text-[13px]">重新搜索</button>
            </div>
            {memberCards.length === 0 ? (
              <div className="px-4 py-8 text-center text-[#94a3b8] text-sm">该会员暂无有效的会员卡</div>
            ) : (
              <>
                <label className="label">选择会员卡</label>
                <div className="space-y-2">
                  {memberCards.map((c) => (
                    <div key={c.id} onClick={() => setSelectedCard(c)} className={`px-4 py-3 rounded-lg border cursor-pointer transition-colors ${selectedCard?.id === c.id ? 'border-blue-400 bg-blue-50 dark:bg-blue-900/20' : 'border-[#e8ecf1] dark:border-gray-700 hover:bg-[#f1f5f9] dark:hover:bg-gray-700/50'}`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span className="font-medium text-[#1a2233] dark:text-white">{c.card_type_info?.name || '未知卡种'}</span>
                          <span className="text-[#94a3b8] ml-3 text-[13px]">{c.card_type === 1 ? '期限卡' : '次数卡'}</span>
                        </div>
                        <div className="text-[13px] text-[#94a3b8]">
                          {c.card_type === 1 ? `到期：${formatTime(c.expire_date)}` : `剩余 ${c.remain_count} 次`}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={handleSign} disabled={!selectedCard || signing} className="btn btn-success h-11 px-8 mt-4 w-full disabled:opacity-40 disabled:cursor-not-allowed">
                  {signing ? '签到中...' : '确认签到'}
                </button>
                {signError && (
                  <div className="mt-3 px-4 py-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 text-red-600 dark:text-red-400 rounded-lg text-sm">{signError}</div>
                )}
              </>
            )}
          </div>
        )}

        {/* 签到结果 */}
        {signResult && (
          <div className="max-w-xl">
            <div className="px-5 py-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/50 rounded-lg">
              <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 font-semibold mb-3">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
                签到成功
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                <div><span className="text-emerald-600/70 dark:text-emerald-500">会员</span><p className="font-medium text-emerald-800 dark:text-emerald-300">{signResult.member_name}</p></div>
                <div><span className="text-emerald-600/70 dark:text-emerald-500">卡种</span><p className="font-medium text-emerald-800 dark:text-emerald-300">{signResult.card_type_name}</p></div>
                <div><span className="text-emerald-600/70 dark:text-emerald-500">{signResult.card_type === 1 ? '到期日期' : '剩余次数'}</span><p className="font-medium text-emerald-800 dark:text-emerald-300">{signResult.card_type === 1 ? formatTime(signResult.expire_date) : `${signResult.remain_count} 次`}</p></div>
                <div><span className="text-emerald-600/70 dark:text-emerald-500">签到时间</span><p className="font-medium text-emerald-800 dark:text-emerald-300">{formatTime(signResult.sign_time)}</p></div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 签到记录 */}
      <div className="card overflow-hidden">
        <div className="px-6 py-4 border-b border-[#e8ecf1] dark:border-gray-700/60 flex items-center justify-between flex-wrap gap-3">
          <h2 className="text-[15.5px] font-semibold text-[#1a2233] dark:text-white">签到记录</h2>
          <div className="flex items-center gap-2">
            <input type="date" value={startDate} onChange={(e) => { setStartDate(e.target.value); setPage(1); }} className="input !h-9 !w-auto text-[13px]" />
            <span className="text-[#94a3b8] text-sm">至</span>
            <input type="date" value={endDate} onChange={(e) => { setEndDate(e.target.value); setPage(1); }} className="input !h-9 !w-auto text-[13px]" />
            {(startDate || endDate) && (
              <button onClick={() => { setStartDate(''); setEndDate(''); setPage(1); }} className="link-btn">清除</button>
            )}
          </div>
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
                  <td className="text-gray-500 dark:text-gray-400 text-[13px]">{formatTime(s.sign_time)}</td>
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
