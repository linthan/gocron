import React from 'react';
import { Icon, InputNumber, message, Select } from 'antd';
import styles from './EscalationForm.less';

const { Option, OptGroup } = Select;
const OPTIONS = [
  { id: 1, name: 'Apples' },
  { id: 2, name: 'Nails' },
  { id: 3, name: 'Bananas' },
  { id: 4, name: 'Helicopters' },
];

const OPTIONS1 = [
  { id: 5, name: 'Apples' },
  { id: 6, name: 'Nails' },
  { id: 7, name: 'Bananas' },
  { id: 8, name: 'Helicopters' },
];
class EscalationRule extends React.PureComponent {
  constructor(props) {
    super(props);
    this.state = {
      selectedItems: [],
    };
  }
  componentWillReceiveProps(nextProps) {}

  render() {
    const { selectedItems } = this.state;
    const { rule, removeRule, setRule } = this.props;
    const { escalation_delay_in_minutes = 30, targets = [] } = rule;

    return (
      <div className={styles.alertEscalationRuleContainer}>
        <div className={styles.alertEscalationPolicyLayer}>
          <div className={styles.alertEscalationPolicyCircle}>
            <span style={{ fontSize: 15 }}>{this.props.level}</span>
          </div>
          <div
            className={styles.alertEscalationPolicyLayerContent}
            style={{ borderRadius: '3px 3px 0 0' }}
          >
            <Icon
              onClick={() => {
                removeRule();
              }}
              className={styles.removeEscalationRule}
              type="close"
            />
            <p>
              <Icon type="share-alt" style={{ marginRight: 6 }} />
              通知下面相关人员或者组
            </p>

            <Select
              placeholder="请选择相关人员联系方式"
              mode="multiple"
              onChange={selectedItems => {
                const tmpRule = { ...rule, targets: selectedItems };
                setRule(tmpRule);
              }}
              value={targets}
              style={{ width: '100%' }}
              labelInValue={true}
              filterOption={(input, option) => {
                return option.props.children.toLowerCase().indexOf(input.toLowerCase()) >= 0;
              }}
            >
              <OptGroup label="员工">
                {OPTIONS.map(item => {
                  return (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  );
                })}
              </OptGroup>
              <OptGroup label="组">
                {OPTIONS1.map(item => {
                  return (
                    <Option key={item.id} value={item.id}>
                      {item.name}
                    </Option>
                  );
                })}
              </OptGroup>
            </Select>
          </div>
          <div
            style={{
              position: 'relative',
              background: '#fff',
              border: 'solid 1px #ddd ',
              borderTop: 'solid 0 #ddd ',
              borderRadius: '0 0 3px 3px',
              lineHeight: '14px',
              padding: '8px',
            }}
          >
            <Icon style={{ fontSize: 14, fontWeight: 'bold', marginRight: 6 }} type="arrow-down" />
            <InputNumber
              value={escalation_delay_in_minutes}
              onChange={value => {
                const tmpRule = { ...rule, escalation_delay_in_minutes: value };
                setRule(tmpRule);
              }}
              min={0}
              style={{ width: 100, marginRight: 6 }}
            />
            分钟后升级到下一级
          </div>
        </div>
      </div>
    );
  }
}
// EscalationRule.propTypes = {
//   level: React.PropTypes.Number,
//   removeRule: React.PropTypes.func,
//   setContacts: React.PropTypes.func,
//   casOption: React.PropTypes.Array,
//   rule: React.PropTypes.Object,
// };
// EscalationRule.defaultProps = {
//   level: 0,
//   removeRule: () => {},
//   setContacts: () => {},
//   casOption: [],
//   rule: {},
// };

export default EscalationRule;
