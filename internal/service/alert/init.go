package alert

import (
	"fmt"

	"github.com/linthan/gocron/internal/service/alert/model"
)

//Service 服务
type Service struct {
}

//Init 初始化
func Init() *Service {
	c := model.New()
	fmt.Println("----", c)
	return &Service{}
}
