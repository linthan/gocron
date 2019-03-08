package user

//SQLDB sql数据库
type SQLDB struct {
	master string
	table  string
}

//Status 用户状态
type Status int8

//定义常量
const (
	Disabled Status = 0 // 禁用
	Failure  Status = 0 // 失败
	Enabled  Status = 1 // 启用
	Running  Status = 1 // 运行中
	Finish   Status = 2 // 完成
	Cancel   Status = 3 // 取消
)

//Init 初始化
func Init(master string) *SQLDB {
	return &SQLDB{
		master: master,
		table:  "cronuser",
	}
}
