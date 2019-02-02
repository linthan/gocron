package model

import (
	"context"
	"errors"
	"time"
)

//Alert 报警实例
type Alert struct {
	Status           string
	alertTimer       *time.Timer
	level            int
	done             chan int
	assign           chan int
	assignTicker     *time.Ticker
	assignee         string
	escalationPolicy *EscalationPolicy
}

//New 初始化一个报警
func New() *Alert {
	a := &Alert{
		alertTimer: time.NewTimer(20 * time.Second),
		done:       make(chan int),
		assign:     make(chan int),
		level:      0,
		Status:     "active",
		escalationPolicy: &EscalationPolicy{
			Rules: []EscalationRule{
				EscalationRule{
					AfterTime: time.Second * 10,
					Targets: []Target{
						EmailTarget{},
					},
				},
				EscalationRule{
					AfterTime: time.Second * 10,
					Targets: []Target{
						EmailTarget{},
					},
				},
			},
		},
	}
	go a.Escalation()
	return a
}

//Escalation 初始化
func (a *Alert) Escalation() {
	c := context.Background()
	c.Done()
	for {
		select {
		case <-a.alertTimer.C:
			a.level++
			nextDuration, err := a.GetDuration()
			if err != nil {
				a.Status = "none"
				return
			}
			a.alertTimer.Reset(nextDuration)
		case <-a.assign:
			a.Status = "assign"
			return
		case <-a.done:
			a.Status = "done"
			return
		}
	}
}

//AssignTo 指派给谁
func (a *Alert) AssignTo(assignee string) {
	a.assignTicker = time.NewTicker(5 * time.Second)
	//指派给谁
	a.assignee = assignee
	a.assign <- 0
	//发送报警

	for {
		select {
		case <-a.assignTicker.C:
		case <-a.done:
			a.Status = "done"
			return
		}
	}
}

//Done 关闭
func (a *Alert) Done() {
	close(a.done)
}

//GetDuration 获取间隔时间
func (a *Alert) GetDuration() (ret time.Duration, err error) {
	if a.escalationPolicy == nil || len(a.escalationPolicy.Rules) == 0 {
		err = errors.New("没有升级策略")
		return
	}
	tmp := a.level % len(a.escalationPolicy.Rules)
	ret = a.escalationPolicy.Rules[tmp].AfterTime
	return
}
