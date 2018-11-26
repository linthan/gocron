import router from 'umi/router';

export function getAuthority() {
  //使用admin
  return ['admin'];
}

export function setAuthority(authority) {
  const proAuthority = typeof authority === 'string' ? [authority] : authority;
  return localStorage.setItem('antd-pro-authority', JSON.stringify(proAuthority));
}

export function setUserInfo(userInfo) {
  return localStorage.setItem('userInfo', JSON.stringify(userInfo));
}

export function setPmsInfo(pmsInfo) {
  return localStorage.setItem('pmsInfo', JSON.stringify(pmsInfo));
}

export function getAuthToken() {
  // const state = window.g_app._store.getState();
  const userInfo = localStorage.getItem('userInfo');
  const userInfoObj = getUserInfo();
  const token = userInfoObj && userInfoObj.token;
  if (!token) {
    router.push('/user/login');
    return {};
  }
  return { 'Auth-Token': token };
}

export function getUserInfo() {
  const userInfo = localStorage.getItem('userInfo');
  let userInfoObj;
  if (userInfo) {
    try {
      userInfoObj = JSON.parse(userInfo);
    } catch (error) {
      router.push('/user/login');
    }
  } else {
    router.push('/user/login');
  }
  return userInfoObj;
}

export function getPmsInfo() {
  const pmsInfo = localStorage.getItem('pmsInfo');
  let pmsInfoObj;
  if (pmsInfo) {
    try {
      pmsInfoObj = JSON.parse(pmsInfo);
    } catch (error) {
      pmsInfoObj = [];
    }
  } else {
    pmsInfoObj = [];
  }
  return pmsInfoObj;
}
