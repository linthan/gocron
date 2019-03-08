package model

import (
	"github.com/linthan/gocron/app/model/sql"
)

//Init 初始化
func Init() {
	sql.Init()
}
