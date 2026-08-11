import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMemberDetail, updateMember } from '../../api/member';
import { issueMemberCard } from '../../api/card';
import type { MemberDetail, CardType } from '../../types';
import { getCardTypeList } from '../../api/card';

export default function MemberDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [member, setMember] = useState<MemberDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({ name: '', phone: '', gender: 0 });
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [cardTypes, setCardTypes] = useState<CardType[]>([]);
  const [issueData, setIssueData] = useState({ card_type_id: 0, buy_price: 0 });

  useEffect(() => {
    if (id) {
      fetchMember();
    }
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

  if (loading) {
    return <div className="text-center py-12">加载中...</div>;
  }

  if (!member) {
    return <div className="text-center py-12">会员不存在</div>;
  }

  return (
    <div>
      <div className="flex items-center mb-6">
        <button onClick={() => navigate('/members')} className="mr-4 text-gray-500 hover:text-gray-700">
          ← 返回
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">会员详情</h1>
      </div>

      {/* 基本信息 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">基本信息</h2>
          {!editing ? (
            <button onClick={() => setEditing(true)} className="text-blue-600 hover:text-blue-800">
              编辑
            </button>
          ) : (
            <div className="space-x-2">
              <button onClick={() => setEditing(false)} className="px-3 py-1 border border-gray-300 rounded">取消</button>
              <button onClick={handleUpdate} className="px-3 py-1 bg-blue-600 text-white rounded">保存</button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">姓名</label>
            {editing ? (
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            ) : (
              <p className="text-gray-900 dark:text-white mt-1">{member.name}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">手机号</label>
            {editing ? (
              <input
                type="text"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              />
            ) : (
              <p className="text-gray-900 dark:text-white mt-1">{member.phone}</p>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">性别</label>
            {editing ? (
              <select
                value={formData.gender}
                onChange={(e) => setFormData({ ...formData, gender: Number(e.target.value) })}
                className="w-full mt-1 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
              >
                <option value={0}>未知</option>
                <option value={1}>男</option>
                <option value={2}>女</option>
              </select>
            ) : (
              <p className="text-gray-900 dark:text-white mt-1">
                {member.gender === 1 ? '男' : member.gender === 2 ? '女' : '未知'}
              </p>
            )}
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">状态</label>
            <p className="text-gray-900 dark:text-white mt-1">
              <span className={`px-2 py-1 text-xs rounded-full ${
                member.status === 1 ? 'bg-green-100 text-green-700' :
                member.status === 2 ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700'
              }`}>
                {member.status === 1 ? '正常' : member.status === 2 ? '冻结' : '已删除'}
              </span>
            </p>
          </div>
          <div>
            <label className="text-sm text-gray-500 dark:text-gray-400">注册时间</label>
            <p className="text-gray-900 dark:text-white mt-1">{member.created_at}</p>
          </div>
        </div>
      </div>

      {/* 会员卡 */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">会员卡</h2>
          <button
            onClick={() => setShowIssueModal(true)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            发放会员卡
          </button>
        </div>

        {member.cards.length === 0 ? (
          <p className="text-gray-500 text-center py-8">暂无会员卡</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {member.cards.map((card) => (
              <div key={card.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="font-medium text-gray-900 dark:text-white">{card.card_type_name}</span>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    card.status === 1 ? 'bg-green-100 text-green-700' :
                    card.status === 2 ? 'bg-red-100 text-red-700' :
                    card.status === 4 ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {card.status_text}
                  </span>
                </div>
                <p className="text-sm text-gray-500 dark:text-gray-400">卡号：{card.card_no}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {card.card_type === 1 ? `剩余 ${card.remain_days} 天` : `剩余 ${card.remain_count} 次`}
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  有效期至：{card.expire_date || '永久'}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 发放会员卡弹窗 */}
      {showIssueModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">发放会员卡</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">选择卡种</label>
                <select
                  value={issueData.card_type_id}
                  onChange={(e) => {
                    const cardType = cardTypes.find(c => c.id === Number(e.target.value));
                    setIssueData({
                      card_type_id: Number(e.target.value),
                      buy_price: cardType?.price || 0
                    });
                  }}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                >
                  <option value={0}>请选择</option>
                  {cardTypes.map((ct) => (
                    <option key={ct.id} value={ct.id}>
                      {ct.name} - ¥{ct.price}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">购买价格</label>
                <input
                  type="number"
                  value={issueData.buy_price}
                  onChange={(e) => setIssueData({ ...issueData, buy_price: Number(e.target.value) })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700"
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => setShowIssueModal(false)} className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg">
                取消
              </button>
              <button onClick={handleIssue} className="px-4 py-2 bg-blue-600 text-white rounded-lg">
                确认开卡
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
