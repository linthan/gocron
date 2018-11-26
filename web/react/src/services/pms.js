import request from '@/utils/request';
import { stringify } from 'qs';

export async function report(params) {
  return request('/api/pms/report', {
    method: 'POST',
    body: params,
  });
}

export async function queryPms(params) {
  return request(`/api/pms/getPermission?${stringify(params)}`);
}

export async function queryOwnPms(params) {
  return request(`/api/pms/getOwnPermission?${stringify(params)}`);
}
