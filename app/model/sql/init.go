package sql

import (
	"github.com/linthan/gocron/app/model/sql/user"
)

//定义服务
var (
	User *user.SQLDB
)

//Init 初始化函数
func Init() {
	User = user.Init("gocron")
}
