package user

//LogInReq 登录请求
type LogInReq struct {
	Username string `form:"username"`
	Password string `form:"password"`
}

//ListReq 用户列表
type ListReq struct {
	Page     int `query:"page"`
	PageSize int `query:"page_size"`
}

//Valid 校验是否合法
func (req *ListReq) Valid() (isValid bool, msg string) {
	if req.Page <= 0 {
		req.Page = 1
	}
	if req.PageSize <= 0 || req.PageSize > 100 {
		req.PageSize = 20
	}
	isValid = true
	return
}
