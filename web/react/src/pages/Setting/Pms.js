import React, { PureComponent, Fragment } from 'react';
import { connect } from 'dva';
import {
  Card,
  Form,
  Row,
  Col,
  Button,
  Tree,
  Divider,
  Input,
  InputNumber,
  Popconfirm,
  Icon,
  Modal,
} from 'antd';
import PageHeaderWrapper from '@/components/PageHeaderWrapper';
import { menuList } from './pms.config';

import styles from './Pms.less';

const FormItem = Form.Item;
const { TreeNode } = Tree;

const getValue = obj =>
  Object.keys(obj)
    .map(key => obj[key])
    .join(',');

const createTitle = '新建权限配置';
const updateTitle = '更新权限配置';

@connect(({ pms, loading }) => ({
  loading: loading.effects['pms/report'],
}))
@Form.create()
export default class Biz extends PureComponent {
  state = {
    treeMenuStyle: {},
    nodeName: '',
    nodeKey: '',
    expandedKeys: [],
    autoExpandParent: true,
    checkedKeys: [],
    selectedKeys: [],
  };

  componentDidMount() {
    const { dispatch } = this.props;
    dispatch({
      type: 'pms/queryPms',
      payload: this.getParam(),
      callback: permission => {
        this.setState({ checkedKeys: permission, expandedKeys: permission });
      },
    });
  }

  onExpand = expandedKeys => {
    this.setState({
      expandedKeys,
      autoExpandParent: false,
    });
  };

  getParam = () => {
    const { match = {} } = this.props;
    const { params } = match;
    return params;
  };

  onCheck = checkedKeys => {
    this.setState({ checkedKeys });
  };

  onSelect = (selectedKeys, info) => {
    this.setState({ selectedKeys });
  };

  onTreeRightClick(e, treeNode) {
    this.setState({
      nodeName: treeNode.props.title,
      nodeKey: treeNode.props.nodeID,

      treeMenuStyle: {
        display: 'block',
        top: e.clientY,
        left: e.clientX,
      },
    });
  }

  genGroupList(treeList = []) {
    const ret = [];
    treeList.map(val => {
      if (val.sub) {
        ret.push(
          <TreeNode
            url={val.url}
            title={`(${val.id})${val.name}(${val.node})`}
            nodeID={val.id}
            key={val.fullPath}
          >
            {this.genGroupList(val.sub)}
          </TreeNode>
        );
      } else {
        ret.push(
          <TreeNode
            url={val.url}
            title={`(${val.id})${val.name}(${val.node})`}
            nodeID={val.id}
            key={val.fullPath}
          />
        );
      }
      return null;
    });
    return ret;
  }

  pmsReport2server() {
    const { dispatch } = this.props;
    const { checkedKeys } = this.state;
    dispatch({
      type: 'pms/report',
      payload: { checks: checkedKeys, ...this.getParam() },
      callback: permission => {
        dispatch({ type: 'pms/queryOwnPms' });
        this.setState({ checkedKeys: permission, expandedKeys: permission });
      },
    });
  }

  render() {
    const { loading } = this.props;

    const {
      createUpdateModalVisible,
      formTitle,
      nodeName,
      nodeKey,
      treeMenuStyle,
      expandedKeys,
      autoExpandParent,
      checkedKeys,
      selectedKeys,
    } = this.state;

    return (
      <PageHeaderWrapper title="权限管理">
        <div
          className={styles.manageMenu}
          onClick={() => {
            this.setState({ treeMenuStyle: { display: 'none' } });
          }}
        >
          <Card bordered={false}>
            <div className={styles.tableList}>
              <div className={styles.tableListOperator}>
                <Button
                  type="primary"
                  loading={loading}
                  onClick={() => {
                    this.pmsReport2server();
                  }}
                >
                  上报权限
                </Button>
              </div>
              <Divider />
              <Row gutter={16}>
                <Col span={6}>
                  {menuList && (
                    <Tree
                      checkable
                      onExpand={this.onExpand}
                      expandedKeys={expandedKeys}
                      autoExpandParent={autoExpandParent}
                      onCheck={this.onCheck}
                      checkedKeys={checkedKeys}
                      onSelect={this.onSelect}
                      selectedKeys={selectedKeys}
                      className={styles.manageTree}
                      showLine
                      onRightClick={args => {
                        this.onTreeRightClick(args.event, args.node);
                      }}
                    >
                      {this.genGroupList(menuList)}
                    </Tree>
                  )}
                </Col>
              </Row>
            </div>
          </Card>
          <div className={styles.treeMenu} style={treeMenuStyle}>
            <ul>
              <li
                className={styles.item}
                onClick={() => {
                  this.addByParent();
                }}
              >
                <Icon type="plus-square-o" className="MR6" />
                新建权限 （{nodeName}）
              </li>
              <li
                className={styles.item}
                onClick={() => {
                  Modal.confirm({
                    content: '确定删除吗？',
                    onOk: () => {
                      this.delete(parseInt(nodeKey, 10));
                    },
                  });
                }}
              >
                <Icon type="delete" className="MR6" />
                删除 （{nodeName}）
              </li>
            </ul>
          </div>
        </div>
      </PageHeaderWrapper>
    );
  }
}
