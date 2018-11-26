package pms

import (
	"fmt"
	"strings"

	"github.com/casbin/casbin"
	xormadapter "github.com/casbin/xorm-adapter"
	"github.com/linthan/gocron/internal/modules/app"
)

//Service 菜单权限服务
type Service struct {
	Casbin *casbin.Enforcer
}

//Init 初始化
func Init() *Service {
	cas := initCasbin()

	return &Service{
		Casbin: cas,
	}
}

func initCasbin() *casbin.Enforcer {
	a := xormadapter.NewAdapter(app.Setting.Db.Engine, fmt.Sprintf("%s:%s@tcp(%s:%d)/%s?charset=utf8&parseTime=True&loc=Local&readTimeout=1s&timeout=1s&writeTimeout=1s",
		app.Setting.Db.User, app.Setting.Db.Password, app.Setting.Db.Host, app.Setting.Db.Port, app.Setting.Db.Database), true)
	e := casbin.NewEnforcer(app.CasbinModelFile, a)
	e.EnableLog(false)
	e.LoadPolicy()
	return e
}

//Report 上报权限
func (s *Service) Report(uid string, checks []string) (ret []string, err error) {
	s.Casbin.RemoveFilteredPolicy(0, uid)
	s.Casbin.SavePolicy()
	for _, item := range checks {
		if !strings.HasSuffix(item, ".*") {
			s.Casbin.AddPolicy(uid, item)
		}
	}
	s.Casbin.SavePolicy()
	ret = s.GetPermission(uid)
	return
}

//GetPermission 获取权限
func (s *Service) GetPermission(uid string) []string {

	data := s.Casbin.GetFilteredPolicy(0, uid)
	permission := make([]string, 0, len(data))
	for _, item := range data {
		permission = append(permission, item[1])
	}
	return permission
}
