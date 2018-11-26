import request from '@/utils/request';

//更新
export async function update(params) {
  return request('/api/system/webhook/update', { method: 'POST', body: params });
}

export async function fetch() {
  return request(`/api/system/webhook`);
}
