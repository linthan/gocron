package err

// 通用错误码
const (
	OK             = 0
	System         = 100001
	Params         = 100002
	Response       = 100003
	RequestLimit   = 100004
	RequestTooMany = 100005
	ErrBind        = 100006

	// 登录
	NotLogin = 101001
)

// 通用错误信息
var commonMsg = map[int]string{
	OK:             "ok",
	System:         "系统错误",
	Params:         "参数错误",
	Response:       "数据异常",
	RequestLimit:   "请求受限",
	RequestTooMany: "请求太频繁",
	ErrBind:        "参数绑定错误",

	// 登录
	NotLogin: "您还未登录",
}
