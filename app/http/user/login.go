package user

import (
	"time"

	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo"
	vuser "github.com/linthan/gocron/app/http/vo/user"
	lerr "github.com/linthan/gocron/app/lib/err"
	"github.com/linthan/gocron/app/lib/response"
	"github.com/linthan/gocron/app/model/sql"
	suser "github.com/linthan/gocron/app/model/sql/user"
)

//token有效期
const tokenDuration = 4 * time.Hour

//Login 登录接口
func Login(c echo.Context) error {
	req := vuser.LogInReq{}
	if err := c.Bind(&req); err != nil {
		return response.JSON(c, lerr.ErrBind, err)

	}
	ok, item := sql.User.Match(req.Username, req.Password)
	if !ok {
		return response.JSON(c, lerr.ErrUsernameOrPassword, ok)
	}
	//生成token
	token, err := generateToken(item)
	if err != nil {
		return response.JSON(c, lerr.ErrUsernameOrPassword, ok)
	}
	//返回token
	return response.JSON(c, lerr.OK, map[string]interface{}{
		"token":    token,
		"uid":      item.ID,
		"username": item.Name,
		"is_admin": item.IsAdmin,
	})
}

// 生成jwt
func generateToken(user *suser.User) (string, error) {
	token := jwt.New(jwt.SigningMethodHS256)
	claims := make(jwt.MapClaims)
	claims["exp"] = time.Now().Add(tokenDuration).Unix()
	claims["uid"] = user.ID
	claims["iat"] = time.Now().Unix()
	claims["issuer"] = "gocron"
	claims["username"] = user.Name
	claims["is_admin"] = user.IsAdmin
	token.Claims = claims

	return token.SignedString([]byte(""))
}
