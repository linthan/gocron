import React, { Component } from 'react';
import router from 'umi/router';
import { connect } from 'dva';
import { Input } from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';

@connect()
class SearchList extends Component {
  handleTabChange = key => {
    const { match } = this.props;
    switch (key) {
      case 'email':
        router.push(`${match.url}/email`);
        break;
      case 'slack':
        router.push(`${match.url}/slack`);
        break;
      case 'webhook':
        router.push(`${match.url}/webhook`);
        break;
      default:
        break;
    }
  };

  handleFormSubmit = value => {
    // eslint-disable-next-line
    console.log(value);
  };

  render() {
    const tabList = [
      {
        key: 'email',
        tab: '邮件',
      },
      {
        key: 'slack',
        tab: 'Slack',
      },
      {
        key: 'webhook',
        tab: 'Webhook',
      },
    ];


    const { match, children, location } = this.props;

    return (
      <PageHeaderWrapper
        title="通知配置"
        content={null}
        tabList={tabList}
        tabActiveKey={location.pathname.replace(`${match.path}/`, '')}
        onTabChange={this.handleTabChange}
      >
        {children}
      </PageHeaderWrapper>
    );
  }
}

export default SearchList;
