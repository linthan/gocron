package err

// 错误信息
var msgs = map[string]map[int]string{
	"common": commonMsg,
}

//GetErrMsg 获取错误信息
func GetErrMsg(errCode int) (res string) {
	res = "未知错误"
	for _, msg := range msgs {
		if resT, ok := msg[errCode]; ok {
			res = resT
			break
		}
	}
	return
}

//RevertErrCode 错误转换
func RevertErrCode(errCode int) (res int) {
	if errCode == 0 {
		return 0
	}
	//应用ID前五位应用ID 后六位错误码
	res = 100000*1000000 + errCode
	return
}
