package user

import (
	"github.com/labstack/echo"
	vuser "github.com/linthan/gocron/app/http/vo/user"
	lerr "github.com/linthan/gocron/app/lib/err"
	"github.com/linthan/gocron/app/lib/response"
	"github.com/linthan/gocron/app/model/sql"
)

//Index index
func Index(c echo.Context) error {
	req := new(vuser.ListReq)
	if err := c.Bind(req); err != nil {
		return response.JSON(c, lerr.ErrBind, err)

	}
	if isValid, msg := req.Valid(); !isValid {
		return response.JSON(c, lerr.Params, msg)
	}
	list, total, err := sql.User.List(req)
	if err != nil {
		return response.JSON(c, lerr.Params, err)
	}
	return response.JSON(c, lerr.OK, map[string]interface{}{
		"data":  list,
		"total": total,
	})
}
