package host

import (
	"github.com/labstack/echo"
	lerr "github.com/linthan/gocron/app/lib/err"
	"github.com/linthan/gocron/app/lib/response"
)

//Index 定时任务系统
func Index(c echo.Context) error {
	return response.JSON(c, lerr.OK, "欢迎来到我的初始化项目")
}
