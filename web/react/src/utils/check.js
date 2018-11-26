import router from 'umi/router';
import { message } from 'antd';

// 处理后端公共结果
export default function check(reponse) {
  // 没有结果
  if (!reponse) {
    router.push('/exception/404');
    return false;
  }
  //没有安装
  if (reponse.code && reponse.code === 801) {
    router.push('/install');
    return false;
  }
  // 没有权
  if (reponse.code && reponse.code === 403) {
    router.push('/exception/403');
    return false;
  }
  // 跳转
  if (reponse.code && reponse.code === 302) {
    window.location.href = reponse.msg;
    return false;
  }
  //没有认证信息
  if (reponse.code && reponse.code === 401) {
    router.push('/user/login');
    return false;
  }

  // 出现错误
  if (reponse.code && reponse.code !== 0) {
    message.error(reponse.message ? reponse.message : '发生错误');
    return false;
  }
  return true;
}
