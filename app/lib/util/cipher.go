package util

import (
	"crypto/md5"
	"encoding/hex"
	"io"
	"mime/multipart"
)

//Md5 生成32位MD5摘要
func Md5(str string) string {
	m := md5.New()
	m.Write([]byte(str))

	return hex.EncodeToString(m.Sum(nil))
}

//MD5file 生成32位MD5file
func MD5file(file multipart.File) string {
	var returnMD5String string
	ctx := md5.New()
	if _, err := io.Copy(ctx, file); err != nil {
		return returnMD5String
	}
	returnMD5String = hex.EncodeToString(ctx.Sum(nil))
	return hex.EncodeToString(ctx.Sum(nil))
}
