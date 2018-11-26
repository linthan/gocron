export const cronMethodMap = {
  1: 'http',
  2: 'shell',
};
export const cronMethoList = [[1, 'http'], [2, 'shell']];

export const taskTypeMap = {
  1: '主任务',
  2: '子任务',
};

export const taskTypeList = [[1, '主任务'], [2, '子任务']];

export const depTypeMap = {
  1: '强依赖',
  2: '弱依赖',
};

export const depTypeList = [[1, '强依赖'], [2, '弱依赖']];

export const protocolMap = {
  1: 'http',
  2: 'shell',
};

export const protocolList = [[1, 'http'], [2, 'shell']];

export const httpMethodMap = {
  1: 'get',
  2: 'post',
};

export const httpMethodList = [[1, 'get'], [2, 'post']];

export const runInstanceTypeMap = {
  2: '是',
  1: '否',
};

export const runInstanceTypeList = [[2, '是'], [1, '否']];

export const notifyStatusTypeMap = {
  1: '不通知',
  2: '失败通知',
  3: '总是通知',
  4: '关键字匹配通知',
};

export const notifyStatusTypeList = [
  [1, '不通知'],
  [2, '失败通知'],
  [3, '总是通知'],
  [4, '关键字匹配通知'],
];

export const notifyTypeMap = {
  2: '邮件',
  3: 'Slack',
  4: 'WebHook',
};

export const notifyTypeList = [[2, '邮件'], [3, 'Slack'], [4, 'WebHook']];

export const statusMap = {
  1: '停止',
  2: '激活',
};

export const statusList = [[1, '停止'], [2, '激活']];

export const runStatusMap = {
  1: '失败',
  2: '执行中',
  3: '成功',
  4: '取消',
};

export const runStatusList = [[1, '失败'], [2, '执行中'], [3, '成功'], [4, '取消']];
