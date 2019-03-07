package host

import (
	"github.com/labstack/echo"
	vhost "github.com/linthan/gocron/app/http/vo/host"
	lerr "github.com/linthan/gocron/app/lib/err"
	"github.com/linthan/gocron/app/lib/response"
)

//List 获取主机列表
func List(c echo.Context) error {
	req := vhost.QueryReq{}
	if err := c.Bind(req); err != nil {
		return response.JSON(c, lerr.ErrBind, err)
	}

	return response.JSON(c, lerr.OK, "欢迎来到我的初始化项目")
}
