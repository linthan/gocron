package model

import (
	"context"
	"fmt"
	"time"
)

//Alert 报警实例
type Alert struct {
	Status       string
	alertTimer   *time.Timer
	level        int
	done         chan int
	assign       chan int
	assignTicker *time.Ticker
	assignee     string
}

//New 初始化一个报警
func New() *Alert {
	a := &Alert{
		alertTimer: time.NewTimer(20 * time.Second),
		done:       make(chan int),
		assign:     make(chan int),
		level:      0,
		Status:     "active",
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
			a.alertTimer.Reset(10 * time.Second)
			a.level++
			fmt.Println("----", a.level)
			if a.level == 3 {
				a.Done()
			}
		case <-a.assign:
			a.Status = "assign"
			return
		case <-a.done:
			fmt.Println("-------done")
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
