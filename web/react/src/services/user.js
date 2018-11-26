import { stringify } from 'qs';
import request from '@/utils/request';

export async function enableUser(params) {
  return request(`/api/user/enable/${params.id || 0}`, {
    method: 'POST',
  });
}

export async function disableUser(params) {
  return request(`/api/user/disable/${params.id || 0}`, {
    method: 'POST',
  });
}

export async function remove(params) {
  return request(`/api/user/remove/${params.id || 0}`, {
    method: 'POST',
  });
}

export async function storeUser(params) {
  return request('/api/user/store', {
    method: 'POST',
    body: params,
  });
}

export async function changePass(params, id) {
  return request(`/api/user/editPassword/${id}`, {
    method: 'POST',
    body: params,
  });
}

export async function editMyPassword(params) {
  return request('/api/user/editMyPassword', { method: 'POST', body: params });
}

export async function query() {
  return request('/api/users');
}

export async function queryCurrent() {
  return request('/api/currentUser');
}

export async function queryUserList(params) {
  return request(`/api/user?${stringify(params)}`);
}
