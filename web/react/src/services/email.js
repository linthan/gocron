import request from '@/utils/request';

export async function storeEmailUser(params) {
  return request('/api/system/mail/user', {
    method: 'POST',
    body: params,
  });
}

//更新
export async function update(params) {
  return request('/api/system/mail/update', {
    method: 'POST',
    body: params,
  });
}

//删除
export async function remove(params) {
  return request(`/api/system/mail/user/remove/${params.id || 0}`, {
    method: 'POST',
  });
}

export async function fetch() {
  return request(`/api/system/mail`);
}
