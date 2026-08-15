import { useState, useEffect } from 'react';
import { getSettings, updateSettings } from '../../api/setting';

export default function SystemSettings() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const resp = await getSettings();
      setSettings(resp.data.data || {});
    } catch (err) {
      console.error('获取配置失败', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateSettings(settings);
      alert('保存成功');
    } catch (err: any) {
      alert(err.message || '保存失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="card p-8 text-center text-gray-400">加载中...</div>;

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="page-title">系统设置</h1>
          <p className="page-desc">门店信息与运营规则配置</p>
        </div>
        <button onClick={handleSave} disabled={saving} className="btn btn-primary">
          {saving ? '保存中...' : '保存设置'}
        </button>
      </div>

      {/* 门店信息 */}
      <div className="card p-6">
        <h2 className="text-[15.5px] font-semibold text-[#1a2233] dark:text-white mb-4">门店信息</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">门店名称</label>
            <input type="text" value={settings.store_name || ''} onChange={(e) => setSettings({ ...settings, store_name: e.target.value })} className="input" placeholder="如：阳光健身房" />
          </div>
          <div>
            <label className="label">门店电话</label>
            <input type="text" value={settings.store_phone || ''} onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })} className="input" placeholder="如：028-12345678" />
          </div>
          <div className="md:col-span-2">
            <label className="label">门店地址</label>
            <input type="text" value={settings.store_address || ''} onChange={(e) => setSettings({ ...settings, store_address: e.target.value })} className="input" placeholder="如：成都市武侯区XX路XX号" />
          </div>
        </div>
      </div>

      {/* 运营规则 */}
      <div className="card p-6">
        <h2 className="text-[15.5px] font-semibold text-[#1a2233] dark:text-white mb-4">运营规则</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="label">到期提醒天数</label>
            <input type="number" value={settings.expire_remind_days || '7'} onChange={(e) => setSettings({ ...settings, expire_remind_days: e.target.value })} className="input" placeholder="7" />
            <p className="text-[12px] text-[#94a3b8] mt-1">仪表盘显示多少天内即将到期的会员卡</p>
          </div>
        </div>
      </div>
    </div>
  );
}
