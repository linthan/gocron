package example

import (
	lerr "github.com/linthan/gocron/app/lib/err"
	"github.com/linthan/gocron/app/lib/response"
	"github.com/labstack/echo"
)


//Hello 测试权限
func Hello(c echo.Context) error {
	return response.JSON(c, lerr.OK, "欢迎来到我的初始化项目")
}

//SayHello aa
func SayHello(c echo.Context) error {
	return response.JSON(c, lerr.OK, "欢迎来到我的初始化项目")
}
