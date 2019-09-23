/**
 * Ant Design Pro v4 use `@ant-design/pro-layout` to handle Layout.
 * You can view component api by:
 * https://github.com/ant-design/ant-design-pro-layout
 */

import OmniLayout from 'omni-layout';
import React from 'react';
import Link from 'umi/link';
import logo from '../assets/logo.svg';

const BasicLayout = props => {
  const { children } = props;
  return (
    <OmniLayout
      {...props}
      logo={() => (
        <a href="/">
          <img src={logo} alt="logo" />
        </a>
      )}
      domain=""
      title="任务管理平台"
      app="cron"
      menuItemRender={(menuItemProps, defaultDom) => (
        <Link to={menuItemProps.path}>{defaultDom}</Link>
      )}
    >
      {children}
    </OmniLayout>
  );
};

export default BasicLayout;
