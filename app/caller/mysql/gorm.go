package mysql

import (
	"github.com/jinzhu/gorm"
	"github.com/linthan/gocron/app/caller"
)

var mysqls = &callerInner{}

// Caller 返回对应mysql的实例
func Caller(key interface{}) *gorm.DB {
	if val, ok := mysqls.instances.Load(key); ok {
		return val.(*gorm.DB)
	}
	return nil
}

func init() {
	caller.Register(mysqls)
}
