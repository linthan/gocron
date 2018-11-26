import { stringify } from 'qs';
import request from '@/utils/request';

export async function queryTask(params) {
  return request(`/api/task?${stringify(params)}`);
}

export async function allHost() {
  return request(`/api/host/all`);
}

export async function email() {
  return request(`/api/system/mail`);
}

export async function slack() {
  return request(`/api/system/slack`);
}

export async function enableTask(params) {
  return request(`/api/task/enable/${params.id || 0}`, {
    method: 'POST',
  });
}

export async function disableTask(params) {
  return request(`/api/task/disable/${params.id || 0}`, {
    method: 'POST',
  });
}

export async function storeTask(params) {
  return request('/api/task/store', {
    method: 'POST',
    body: params,
  });
}

export async function remove(params) {
  return request(`/api/task/remove/${params.id}`, { method: 'POST' });
}

export async function runTask(params) {
  return request(`/api/task/run/${params.id || 0}`);
}
