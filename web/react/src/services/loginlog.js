import { stringify } from 'qs';
import request from '@/utils/request';

export async function queryLog(params) {
  return request(`/api/system/login-log?${stringify(params)}`);
}
