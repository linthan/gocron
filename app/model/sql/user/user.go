package user

import (
	"time"

	"github.com/linthan/gocron/app/caller/sql"
	vuser "github.com/linthan/gocron/app/http/vo/user"
	"github.com/linthan/gocron/app/lib/util"
)

//User 用户
type User struct {
	ID       int       `json:"id" gorm:"column:id"`
	Name     string    `json:"name" gorm:"column:name"`   // 用户名
	Password string    `json:"-" gorm:"column:password"`  // 密码
	Salt     string    `json:"-" gorm:"column:salt"`      // 密码盐值
	Email    string    `json:"email" gorm:"column:email"` // 邮箱
	Created  time.Time `json:"created" gorm:"column:created"`
	Updated  time.Time `json:"updated" gorm:"column:updated"`
	IsAdmin  int8      `json:"is_admin" gorm:"column:is_admin"` // 是否是管理员 1:管理员 0:普通用户
	Status   Status    `json:"status" gorm:"column:status"`     // 1: 正常 0:禁用
}

//TableName 表名
func (u User) TableName() string {
	return "cronuser"
}

//Match 判断是否有错误
func (s *SQLDB) Match(username, password string) (match bool, ret *User) {
	ret = &User{}
	err := sql.Caller(s.master).Where("(name = ? OR email = ?) AND status =?", username, username, Enabled).Find(ret).Error
	if err != nil {
		match = false
		return
	}
	hashPassword := s.encryptPassword(password, ret.Salt)
	if hashPassword != ret.Password {
		match = false
		return
	}
	match = true
	return
}

// 密码加密
func (s *SQLDB) encryptPassword(password, salt string) string {
	return util.Md5(password + salt)
}

//List 判断是否有错误
func (s *SQLDB) List(req *vuser.ListReq) (ret []User, total int, err error) {
	//获取长度
	sql.Caller(s.master).Table(s.table).Count(&total)
	//计算size
	offset := (req.Page - 1) * req.PageSize
	err = sql.Caller(s.master).Offset(offset).Limit(req.PageSize).Order("id desc").Find(&ret).Error
	return
}
