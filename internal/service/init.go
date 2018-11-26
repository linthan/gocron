package service

import (
	"github.com/linthan/gocron/internal/service/pms"
)

//定义全局常量
var (
	TaskSrv Task
	PmsSrv  *pms.Service
)

//Init 初始化服务
func Init() {
	PmsSrv = pms.Init()
}
