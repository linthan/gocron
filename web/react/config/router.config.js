export default [
  // user
  {
    path: '/install',
    component: './Install',
    hideInMenu: true,
  },
  // user
  {
    path: '/user',
    component: '../layouts/UserLayout',
    routes: [
      { path: '/user', redirect: '/user/login' },
      { path: '/user/login', component: './User/Login' },
      { path: '/user/edit-pass', component: './User/EditPass' },
    ],
  },
  // app
  {
    path: '/',
    permission: '*',
    component: '../layouts/OmniLayout',
    Routes: ['src/pages/Authorized'],
    authority: ['admin', 'user'],
    routes: [
      // dashboard
      { path: '/', redirect: '/task/manage' },
      {
        path: '/task',
        name: 'task',
        permission: 'task',
        icon: 'dashboard',
        routes: [
          {
            path: '/task/manage',
            name: 'manage',
            permission: 'task.manage',
            component: './Task/Manage',
            icon: 'edit',
          },
          {
            path: '/task/log',
            name: 'log',
            permission: 'task.log',
            component: './Task/Log',
            icon: 'file-search',
          },
          {
            path: '/task/node',
            name: 'node',
            permission: 'task.node',
            component: './Task/Node',
            icon: 'database',
          },
          {
            path: '/task/escalation_policy',
            name: 'escalation_policy',
            permission: 'task.escalation_policy',
            component: './Task/EscalationPolicy',
            icon: 'database',
          },
        ],
      },
      // forms
      {
        path: '/setting',
        icon: 'setting',
        name: 'setting',
        permission: 'setting',
        routes: [
          {
            path: '/setting/user',
            name: 'user',
            permission: 'setting.user',
            component: './Setting/User',
            icon: 'user',
          },
          {
            path: '/setting/notify-config',
            name: 'notify-config',
            permission: 'setting.notify-config',
            component: './Setting/List',
            icon: 'notification',
            routes: [
              {
                path: '/setting/notify-config',
                redirect: '/setting/notify-config/email',
              },
              {
                path: '/setting/notify-config/email',
                name: 'email',
                permission: 'setting.notify-config',
                component: './Setting/Email',
                icon: 'mail',
              },
              {
                path: '/setting/notify-config/slack',
                name: 'slack',
                permission: 'setting.notify-config',
                component: './Setting/Slack',
                icon: 'slack',
              },
              {
                path: '/setting/notify-config/webhook',
                name: 'webhook',
                permission: 'setting.notify-config',
                component: './Setting/Webhook',
                icon: 'ie',
              },
            ],
          },
          {
            path: '/setting/login-log',
            name: 'login-log',
            // permission: 'setting.login-log',
            authority: ['admin'],
            component: './Setting/LoginLog',
            permission: 'setting.login-log',
            icon: 'file-search',
          },
          {
            path: '/setting/pms/:id',
            hideInMenu: true,
            name: 'pms',
            component: './Setting/Pms',
            icon: 'lock',
          },
        ],
      },
      {
        name: 'exception',
        icon: 'warning',
        path: '/exception',
        hideInMenu: true,
        routes: [
          // exception
          {
            path: '/exception/403',
            name: 'not-permission',
            component: './Exception/403',
          },
          {
            path: '/exception/404',
            name: 'not-find',
            component: './Exception/404',
          },
          {
            path: '/exception/500',
            name: 'server-error',
            component: './Exception/500',
          },
          {
            path: '/exception/trigger',
            name: 'trigger',
            hideInMenu: true,
            component: './Exception/TriggerException',
          },
        ],
      },
      {
        component: '404',
      },
    ],
  },
];
