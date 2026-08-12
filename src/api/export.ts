import request from './request';

// 从响应头提取文件名，触发浏览器下载
function downloadBlob(response: any, fallbackName: string) {
  const blob = new Blob([response.data], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });

  // 尝试从 Content-Disposition 提取文件名
  const disposition = response.headers['content-disposition'] || '';
  const match = disposition.match(/filename=([^;\s]+)/);
  const filename = match ? match[1] : fallbackName;

  const url = window.URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

// 导出会员列表
export const exportMembers = async () => {
  const response = await request.get('/export/members', { responseType: 'blob' });
  downloadBlob(response, 'members.xlsx');
};

// 导出交易记录
export const exportTransactions = async () => {
  const response = await request.get('/export/transactions', { responseType: 'blob' });
  downloadBlob(response, 'transactions.xlsx');
};
