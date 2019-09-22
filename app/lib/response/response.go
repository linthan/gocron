package response

import (
	"net/http"

	"github.com/labstack/echo"
	lerr "github.com/linthan/gocron/app/lib/err"
)

//JSONResult json数据
type JSONResult struct {
	Error int         `json:"code"`
	Msg   string      `json:"message"`
	Data  interface{} `json:"data"`
}

//JSON json数据
func JSON(c echo.Context, error int, data interface{}) error {
	result := new(JSONResult)
	result.Error = lerr.RevertErrCode(error)
	result.Msg = lerr.GetErrMsg(error)
	result.Data = data
	return c.JSON(http.StatusOK, result)
}
