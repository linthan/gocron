package response

// 数据encode
type Encode interface {
	// 签名
	MakeSign(clientType uint32, clientRandom string, data interface{}) (sign string, serverRandom string)
}
