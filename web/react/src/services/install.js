import request from '@/utils/request';

export async function store(params) {
  return request('/api/install/store', {
    method: 'POST',
    body: params,
  });
}
