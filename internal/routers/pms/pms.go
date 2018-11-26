package pms

import (
	"fmt"

	"github.com/linthan/gocron/internal/modules/utils"
	"github.com/linthan/gocron/internal/service"
	"gopkg.in/macaron.v1"
)

//JSON json结构体
type JSON struct {
	ID     int      `json:"id,string"`
	Checks []string `json:"checks"`
}

//Report 上报权限
func Report(ctx *macaron.Context, j JSON) string {
	jsonResp := utils.JsonResponse{}
	if !IsAdmin(ctx) {
		return jsonResp.Failure(-1, "不是管理员")
	}
	if j.ID == 0 {
		return jsonResp.Failure(-1, "非法用户")
	}

	if len(j.Checks) == 0 {
		return jsonResp.Success("上报权限成功", map[string]interface{}{})
	}
	ret, err := service.PmsSrv.Report(fmt.Sprintf("%d", j.ID), j.Checks)
	if err != nil {
		return jsonResp.Failure(-1, err.Error())
	}
	return jsonResp.Success("上报权限成功", map[string]interface{}{
		"pms": ret,
	})
}

//GetPermission 获取权限
func GetPermission(ctx *macaron.Context) string {
	jsonResp := utils.JsonResponse{}
	id := ctx.QueryInt("id")
	if id == 0 {
		return jsonResp.Failure(-1, "非法用户")
	}
	ret := service.PmsSrv.GetPermission(fmt.Sprintf("%d", id))
	return jsonResp.Success("获取权限成功", map[string]interface{}{
		"pms": ret,
	})
}

//GetOwnPermission 获取权限
func GetOwnPermission(ctx *macaron.Context) string {
	jsonResp := utils.JsonResponse{}
	id := UID(ctx)
	if id == 0 {
		return jsonResp.Failure(-1, "非法用户")
	}
	ret := service.PmsSrv.GetPermission(fmt.Sprintf("%d", id))
	return jsonResp.Success("获取权限成功", map[string]interface{}{
		"pms": ret,
	})
}

// UID 获取session中的UID
func UID(ctx *macaron.Context) int {
	uidInterface, ok := ctx.Data["uid"]
	if !ok {
		return 0
	}
	if uid, ok := uidInterface.(int); ok {
		return uid
	} else {
		return 0
	}
}

// IsAdmin 判断当前用户是否是管理员
func IsAdmin(ctx *macaron.Context) bool {
	isAdmin, ok := ctx.Data["is_admin"]
	if !ok {
		return false
	}
	if v, ok := isAdmin.(int); ok {
		return v > 0
	} else {
		return false
	}
}
