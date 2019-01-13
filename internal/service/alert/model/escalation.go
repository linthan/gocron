package model

import "time"

//EscalationRule 升级规则
type EscalationRule struct {
	AfterTime time.Duration
	Targets   []Target
}

//EscalationPolicy 升级策略
type EscalationPolicy struct {
	Rules []EscalationRule
}

//Target 报警对象
type Target interface{}
