package err

// 登录错误
const (
	ErrUsernameOrPasswordEmpty = 200001
	ErrUsernameOrPassword      = 200002
	ErrGenerateToken           = 200003
)

// 登录错误
var authMsg = map[int]string{
	ErrUsernameOrPassword:      "用户名或密码错误",
	ErrUsernameOrPasswordEmpty: "用户名、密码不能为空",
	ErrGenerateToken:           "生成token出错",
}
