package handler

import (
	"net/http"

	"github.com/labstack/echo"
)

const (
	// MsgOk ajax输出错误码，成功
	MsgOk = 0
	// MsgRedirect ajax输出错误码，成功
	MsgRedirect = 302
	// MsgErr 错误
	MsgErr = 1
	//MsgForbidden 权限不足
	MsgForbidden = 403
)

/*  */
// JSONResult json
type JSONResult struct {
	Code    int         `json:"error"`
	Message string      `json:"msg"`
	Data    interface{} `json:"data"`
}

// JSON 提供了系统标准JSON输出方法。
func JSON(c echo.Context, errCode int, message string, data ...interface{}) error {
	result := new(JSONResult)
	result.Code = errCode
	result.Message = message

	if len(data) > 0 {
		result.Data = data[0]
	} else {
		result.Data = ""
	}
	return c.JSON(http.StatusOK, result)
}
