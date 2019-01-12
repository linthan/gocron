import { Tag, Input, Tooltip, Icon } from 'antd';
import React from 'react';
import styles from './EscalationForm.less';
import EscalationRule from './escalationRule';

class EscalationInput extends React.Component {
  render() {
    const { value = [], onChange } = this.props;
    return (
      <>
        <div className={styles.alertEscalationPolicy}>
          <div className={styles.alertEscalationRules}>
            <div>
              <div className={styles.alertEscalationPolicyLayer}>
                <div className={styles.alertEscalationPolicyCircle}>
                  <Icon style={{ fontSize: 15 }} type="exclamation" />
                </div>
                <div className={styles.alertEscalationPolicyLayerContent}>
                  <p>报警触发后开始计时</p>
                </div>
              </div>
              <div className={styles.alertEscalationRulesContainer}>
                <div className={styles.alertEscalationRuleList}>
                  {value.map((item, idx) => {
                    return (
                      <EscalationRule
                        removeRule={() => {
                          const tmp = [...value];
                          tmp.splice(idx, 1);
                          onChange(tmp);
                        }}
                        setRule={rule => {
                          const tmp = [...value];
                          tmp[idx] = rule;
                          onChange(tmp);
                        }}
                        rule={item}
                        level={idx + 1}
                      />
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className={styles.alertEscalationPolicyLayer}>
          <div
            onClick={() => {
              const tmp = [...value];
              tmp.push({ escalation_delay_in_minutes: 30, targets: [] });
              onChange(tmp);
            }}
            className={styles.EscalationPpolicyLayerAdd}
          >
            <div className={styles.alertEscalationPolicyCircle}>
              <Icon style={{ fontSize: 15 }} type="plus" />
            </div>
            <div className={styles.alertEscalationPolicyLayerContent}>
              <p>添加升级策略</p>
            </div>
          </div>
        </div>
      </>
    );
  }
}
export default EscalationInput;
