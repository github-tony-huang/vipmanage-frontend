import { useState, useEffect } from 'react';
import { getCardTypeList, createCardType, updateCardType, deleteCardType } from '../../api/card';
import type { CardType } from '../../types';

export default function CardTypeList() {
  const [cardTypes, setCardTypes] = useState<CardType[]>([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    card_type: 1,
    valid_days: 30,
    valid_count: 0,
    price: 0,
    description: '',
  });

  useEffect(() => {
    fetchCardTypes();
  }, []);

  const fetchCardTypes = async () => {
    setLoading(true);
    try {
      const response = await getCardTypeList();
      setCardTypes(response.data.data);
    } catch (err) {
      console.error('获取卡种列表失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    try {
      const data = {
        ...formData,
        valid_count: formData.card_type === 2 ? formData.valid_count : undefined,
        valid_days: formData.card_type === 1 ? formData.valid_days : undefined,
      };
      if (editingId) {
        await updateCardType(editingId, data);
      } else {
        await createCardType(data);
      }
      setShowModal(false);
      resetForm();
      fetchCardTypes();
    } catch (err: any) {
      alert(err.message || '操作失败');
    }
  };

  const handleEdit = (cardType: CardType) => {
    setEditingId(cardType.id);
    setFormData({
      name: cardType.name,
      card_type: cardType.card_type,
      valid_days: cardType.valid_days || 30,
      valid_count: cardType.valid_count || 0,
      price: cardType.price,
      description: cardType.description || '',
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除该卡种吗？')) return;
    try {
      await deleteCardType(id);
      fetchCardTypes();
    } catch (err: any) {
      alert(err.message || '删除失败');
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setFormData({
      name: '',
      card_type: 1,
      valid_days: 30,
      valid_count: 0,
      price: 0,
      description: '',
    });
  };

  const getStatusBadge = (status: number) => {
    return status === 1 ? (
      <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">正常</span>
    ) : (
      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-700">停用</span>
    );
  };

  const getCardTypeBadge = (type: number) => {
    return type === 1 ? (
      <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">期限卡</span>
    ) : (
      <span className="px-2 py-1 text-xs rounded-full bg-purple-100 text-purple-700">次数卡</span>
    );
  };

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">卡种管理</h1>
        <button
          onClick={() => { resetForm(); setShowModal(true); }}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
        >
          添加卡种
        </button>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-700">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">名称</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">类型</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">有效期</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">价格</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">状态</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
            {loading ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center">加载中...</td></tr>
            ) : cardTypes.length === 0 ? (
              <tr><td colSpan={6} className="px-6 py-12 text-center">暂无数据</td></tr>
            ) : (
              cardTypes.map((ct) => (
                <tr key={ct.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 font-medium text-gray-900 dark:text-white">{ct.name}</td>
                  <td className="px-6 py-4">{getCardTypeBadge(ct.card_type)}</td>
                  <td className="px-6 py-4 text-gray-500">
                    {ct.card_type === 1 ? `${ct.valid_days}天` : `${ct.valid_count}次`}
                  </td>
                  <td className="px-6 py-4 text-gray-900 dark:text-white">¥{ct.price}</td>
                  <td className="px-6 py-4">{getStatusBadge(ct.status)}</td>
                  <td className="px-6 py-4 text-right space-x-2">
                    <button onClick={() => handleEdit(ct)} className="text-blue-600 hover:text-blue-800">编辑</button>
                    <button onClick={() => handleDelete(ct.id)} className="text-red-600 hover:text-red-800">删除</button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
              {editingId ? '编辑卡种' : '添加卡种'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">名称</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">类型</label>
                <select
                  value={formData.card_type}
                  onChange={(e) => setFormData({ ...formData, card_type: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value={1}>期限卡</option>
                  <option value={2}>次数卡</option>
                </select>
              </div>
              {formData.card_type === 1 ? (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">有效期（天）</label>
                  <input
                    type="number"
                    value={formData.valid_days}
                    onChange={(e) => setFormData({ ...formData, valid_days: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">可用次数</label>
                  <input
                    type="number"
                    value={formData.valid_count}
                    onChange={(e) => setFormData({ ...formData, valid_count: Number(e.target.value) })}
                    className="w-full px-4 py-2 border rounded-lg"
                  />
                </div>
              )}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">价格</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })}
                  className="w-full px-4 py-2 border rounded-lg"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">描述</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-4 py-2 border rounded-lg"
                  rows={3}
                />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowModal(false); resetForm(); }} className="px-4 py-2 border rounded-lg">取消</button>
              <button onClick={handleSubmit} className="px-4 py-2 bg-blue-600 text-white rounded-lg">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
