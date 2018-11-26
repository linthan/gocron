import { stringify } from 'qs';
import request from '@/utils/request';

export async function queryLog(params) {
  return request(`/api/task/log?${stringify(params)}`);
}

export async function cleanLog() {
  return request(`/api/task/log/clear`, { method: 'POST' });
}
