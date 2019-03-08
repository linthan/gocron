package user

//LogInReq 登录请求
type LogInReq struct {
	Username string `query:"username"`
	Password string `query:"password"`
}

//ListReq 用户列表
type ListReq struct {
	Page     int `query:"page"`
	PageSize int `query:"page_size"`
}
