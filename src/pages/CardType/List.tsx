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
    setFormData({ name: '', card_type: 1, valid_days: 30, valid_count: 0, price: 0, description: '' });
  };

  return (
    <div className="space-y-5">
      {/* 页头 */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">卡种管理</h1>
          <p className="page-desc">共 {cardTypes.length} 种卡</p>
        </div>
        <button onClick={() => { resetForm(); setShowModal(true); }} className="btn btn-primary">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" /></svg>
          添加卡种
        </button>
      </div>

      {/* 卡种列表 */}
      <div className="card overflow-hidden">
        <table className="table">
          <thead>
            <tr>
              <th>名称</th>
              <th>类型</th>
              <th>有效期 / 次数</th>
              <th>价格</th>
              <th>状态</th>
              <th className="text-right">操作</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} className="!py-16 text-center text-gray-400">加载中...</td></tr>
            ) : cardTypes.length === 0 ? (
              <tr>
                <td colSpan={6} className="!py-16 text-center text-gray-400">
                  <svg className="w-10 h-10 mx-auto mb-2 empty-icon" fill="none" stroke="currentColor" strokeWidth={1.5} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" /></svg>
                  暂无卡种
                </td>
              </tr>
            ) : (
              cardTypes.map((ct) => (
                <tr key={ct.id}>
                  <td className="font-medium">{ct.name}</td>
                  <td>
                    {ct.card_type === 1
                      ? <span className="badge badge-info">期限卡</span>
                      : <span className="badge" style={{ background: '#f3e8ff', color: '#7e22ce' }}>次数卡</span>}
                  </td>
                  <td className="text-gray-600 dark:text-gray-300">
                    {ct.card_type === 1 ? `${ct.valid_days} 天` : `${ct.valid_count} 次`}
                  </td>
                  <td className="font-semibold text-gray-900 dark:text-white">¥{ct.price}</td>
                  <td>
                    {ct.status === 1
                      ? <span className="badge badge-success"><span className="dot"></span>正常</span>
                      : <span className="badge badge-muted"><span className="dot"></span>停用</span>}
                  </td>
                  <td>
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => handleEdit(ct)} className="link-btn">编辑</button>
                      <button onClick={() => handleDelete(ct.id)} className="link-btn danger">删除</button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* 弹窗 */}
      {showModal && (
        <div className="modal-mask" onClick={() => { setShowModal(false); resetForm(); }}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-lg font-semibold text-[#1a2233] dark:text-white mb-5">
              {editingId ? '编辑卡种' : '添加卡种'}
            </h2>
            <div className="space-y-4">
              <div>
                <label className="label">名称 <span className="text-red-500">*</span></label>
                <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="input" placeholder="如：月卡 / 30次卡" />
              </div>
              <div>
                <label className="label">类型</label>
                <select value={formData.card_type} onChange={(e) => setFormData({ ...formData, card_type: Number(e.target.value) })} className="input">
                  <option value={1}>期限卡（按天数）</option>
                  <option value={2}>次数卡（按次数）</option>
                </select>
              </div>
              {formData.card_type === 1 ? (
                <div>
                  <label className="label">有效期（天）</label>
                  <input type="number" value={formData.valid_days} onChange={(e) => setFormData({ ...formData, valid_days: Number(e.target.value) })} className="input" />
                </div>
              ) : (
                <div>
                  <label className="label">可用次数</label>
                  <input type="number" value={formData.valid_count} onChange={(e) => setFormData({ ...formData, valid_count: Number(e.target.value) })} className="input" />
                </div>
              )}
              <div>
                <label className="label">价格（元） <span className="text-red-500">*</span></label>
                <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: Number(e.target.value) })} className="input" />
              </div>
              <div>
                <label className="label">描述</label>
                <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="input" rows={3} placeholder="选填" />
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-6">
              <button onClick={() => { setShowModal(false); resetForm(); }} className="btn btn-secondary">取消</button>
              <button onClick={handleSubmit} className="btn btn-primary">保存</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
