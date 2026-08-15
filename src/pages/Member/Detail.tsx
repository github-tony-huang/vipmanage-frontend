import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMemberDetail, updateMember } from '../../api/member';
import { issueMemberCard } from '../../api/card';
import type { MemberDetail, CardType } from '../../types';
import { getCardTypeList } from '../../api/card';
import { formatTime, calcRemainDays } from '../../utils/format';

export default function MemberDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', gender: 0, birthday: '' });
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [cardTypes, setCardTypes] = useState<CardType[]>([]);
  const [issueData, setIssueData] = useState({ card_type_id: 0, buy_price: 0 });

  useEffect(() => {
    if (id) fetchMember();
  }, [id]);

  useEffect(() => {
    fetchCardTypes();
  }, []);

  const fetchMember = async () => {
    try {
      const response = await getMemberDetail(Number(id));
      setMember(response.data.data);
      setFormData({
        name: response.data.data.name,
        phone: response.data.data.phone,
        gender: response.data.data.gender,
        birthday: response.data.data.birthday || '',
      });
    } catch (err) {
      console.error('获取会员详情失败', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCardTypes = async () => {
    try {
      const response = await getCardTypeList({ status: 1 });
      setCardTypes(response.data.data);
    } catch (err) {
      console.error('获取卡种列表失败', err);
    }
  };

  const handleUpdate = async () => {
    try {
      await updateMember(Number(id), formData);
      setEditing(false);
      fetchMember();
    } catch (err: any) {
      alert(err.message || '更新失败');
    }
  };

  const handleIssue = async () => {
    try {
      await issueMemberCard({ member_id: Number(id), ...issueData });
      setShowIssueModal(false);
      fetchMember();
    } catch (err: any) {
      alert(err.message || '开卡失败');
    }
  };

  const getStatusBadge = (status: number, text?: string) => {
    const map: Record<number, { cls: string; text: string }> = {
      1: { cls: 'badge badge-success', text: '正常' },
      2: { cls: 'badge badge-danger', text: '冻结' },
      3: { cls: 'badge badge-warning', text: '已用完' },
      4: { cls: 'badge badge-warning', text: '已过期' },
      5: { cls: 'badge badge-muted', text: '已退卡' },
    };
    const item = map[status] || map[1];
    return <span className={item.cls}><span className="dot"></span>{text || item.text}</span>;
  };

  if (loading) {
    return <div className="text-center py-20 text-gray-400">加载中...</div>;
  }

  if (!member) {
    return <div className="text-center py-20 text-gray-400">会员不存在</div>;
  }

  return (
    <div className="space-y-5">
      {/* 页头 */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate('/members')}
          className="w-9 h-9 flex items-center justify-center rounded-[9px] border border-[#dbe1e8] dark:border-gray-600 text-[#4a5568] dark:text-gray-300 hover:border-[#3b5bfd] hover:text-[#3b5bfd] dark:hover:text-blue-400 transition-colors"
          title="返回"
        >
          <svg className="w-[18px] h-[18px]" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
        </button>
        <div>
          <h1 className="page-title">会员详情</h1>
          <p className="page-desc">{member.name} · {member.phone}</p>
        </div>
      </div>

      {/* 基本信息 */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-[15.5px] font-semibold text-[#1a2233] dark:text-white">基本信息</h2>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="link-btn">编辑</button>
          ) : (
            <div className="flex gap-2">
              <button onClick={() => setEditing(false)} className="btn btn-secondary btn-sm">取消</button>
              <button onClick={handleUpdate} className="btn btn-primary btn-sm">保存</button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-5">
          <div>
            <label className="text-[13px] text-[#94a3b8] dark:text-gray-400">姓名</label>
            {editing ? (
              <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input mt-1.5" />
            ) : (
              <p className="text-[#1a2233] dark:text-white font-medium mt-1">{member.name}</p>
            )}
          </div>
          <div>
            <label className="text-[13px] text-[#94a3b8] dark:text-gray-400">手机号</label>
            {editing ? (
              <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="input mt-1.5" />
            ) : (
              <p className="text-[#1a2233] dark:text-white font-medium mt-1">{member.phone}</p>
            )}
          </div>
          <div>
            <label className="text-[13px] text-[#94a3b8] dark:text-gray-400">性别</label>
            {editing ? (
              <select value={formData.gender} onChange={(e) => setFormData({ ...formData, gender: Number(e.target.value) })} className="input mt-1.5">
                <option value={0}>未知</option>
                <option value={1}>男</option>
                <option value={2}>女</option>
              </select>
            ) : (
              <p className="text-[#1a2233] dark:text-white font-medium mt-1">{member.gender === 1 ? '男' : member.gender === 2 ? '女' : '未知'}</p>
            )}
          </div>
          <div>
            <label className="text-[13px] text-[#94a3b8] dark:text-gray-400">生日</label>
            {editing ? (
              <input type="date" value={formData.birthday} onChange={(e) => setFormData({ ...formData, birthday: e.target.value })} className="input mt-1.5" />
            ) : (
              <p className="text-[#1a2233] dark:text-white font-medium mt-1">{member.birthday || '未设置'}</p>
            )}
          </div>
          <div>
            <label className="text-[13px] text-[#94a3b8] dark:text-gray-400">状态</label>
            <p className="mt-1">{getStatusBadge(member.status, member.status_text)}</p>
          </div>
          <div>
            <label className="text-[13px] text-[#94a3b8] dark:text-gray-400">注册时间</label>
            <p className="text-[#1a2233] dark:text-white font-medium mt-1 text-[13.5px]">{formatTime(member.created_at)}</p>
          </div>
        </div>
      </div>

      {/* 会员卡 */}
      <div className="card p-6">
        <div className="flex justify-between items-center mb-5">
          <h2 className="text-[15.5px] font-semibold text-[#1a2233] dark:text-white">会员卡</h2>
          <button onClick={() => setShowIssueModal(true)} className="btn btn-primary btn-sm">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
            发放会员卡
          </button>
        </div>

        {member.cards.length === 0 ? (
          <div className="text-center py-14 text-gray-400">
            <svg className="w-10 h-10 mx-auto mb-2 empty-icon" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M15 5v2m0 4v2m0 4v2M5 5a2 2 0 00-2 2v3a2 2 0 110 4v3a2 2 0 002 2h14a2 2 0 002-2v-3a2 2 0 110-4V7a2 2 0 00-2-2H5z" /></svg>
            <p className="text-sm">暂无会员卡</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {member.cards.map((card) => (
              <div key={card.id} className="border border-[#e8ecf1] dark:border-gray-600 rounded-xl p-4 hover:shadow-md transition-shadow bg-[#fbfcfd] dark:bg-gray-700/30">
                <div className="flex justify-between items-start mb-3">
                  <span className="font-semibold text-[#1a2233] dark:text-white">{card.card_type_name}</span>
                  {getStatusBadge(card.status, card.status_text)}
                </div>
                <div className="space-y-1.5 text-[13px] text-[#4a5568] dark:text-gray-300">
                  <p className="font-mono">卡号：{card.card_no}</p>
                  <p className="font-medium text-[#3b5bfd] dark:text-blue-400">
                    {card.card_type === 1 ? `剩余 ${calcRemainDays(card.expire_date)} 天` : `剩余 ${card.remain_count} 次`}
                  </p>
                  <p className="text-[#94a3b8] dark:text-gray-500">有效期至：{card.expire_date ? formatTime(card.expire_date) : '永久'}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 发放会员卡弹窗 */}
      {showIssueModal && (
        <div className="modal-mask" onClick={() => setShowIssueModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[#1a2233] dark:text-white mb-5">发放会员卡</h2>
            <div className="space-y-4">
              <div>
                <label className="label">选择卡种 <span className="text-red-500">*</span></label>
                <select
                  value={issueData.card_type_id}
                  onChange={(e) => {
                    const cardType = cardTypes.find(c => c.id === Number(e.target.value));
                    setIssueData({ card_type_id: Number(e.target.value), buy_price: cardType?.price || 0 });
                  }}
                  className="input"
                >
                  <option value={0}>请选择</option>
                  {cardTypes.map((ct) => (
                    <option key={ct.id} value={ct.id}>{ct.name} - ¥{ct.price}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="label">购买价格（元） <span className="text-red-500">*</span></label>
                <input type="number" value={issueData.buy_price} onChange={(e) => setIssueData({ ...issueData, buy_price: Number(e.target.value) })} className="input" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowIssueModal(false)} className="btn btn-secondary">取消</button>
              <button onClick={handleIssue} className="btn btn-primary">确认开卡</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
