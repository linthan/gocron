import { stringify } from 'qs';
import request from '@/utils/request';

export async function queryHost(params) {
  return request(`/api/host?${stringify(params)}`);
}

export async function ping(params) {
  return request(`/api/host/ping/${params.id}`);
}


export async function storeNode(params) {
  return request('/api/host/store', {
    method: 'POST',
    body: params,
  });
}

export async function remove(params) {
  return request(`/api/host/remove/${params.id}`, {
    method: 'POST',
  });
}
