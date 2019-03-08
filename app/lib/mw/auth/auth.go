package auth

import (
	"errors"
	"fmt"
	"net/http"

	"github.com/dgrijalva/jwt-go"
	"github.com/labstack/echo"
)

// DefaultAuth is the default instance of WSDAuth.
var DefaultAuth = Auth{}

//RedirectParam 返回的url
var RedirectParam = "return_url"

//Auth constructs a OAuth middleware.
type Auth struct {
	Authenticator func(echo.Context) error
	Unauthorized  func(echo.Context) error
}

// Func implements Middleware interface.
func (w Auth) Func() echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			if e := w.Authenticator(c); e != nil {
				return w.Unauthorized(c)
			}
			return next(c)
		}
	}
}

// NewAuth 构造WSDAuth中间件实例。
func NewAuth(domain string, loginURL string) *Auth {
	return &Auth{
		Authenticator: func(c echo.Context) error {
			authToken := c.Request().Header.Get("Auth-Token")
			if authToken == "" {
				return errors.New("没有token")
			}
			token, err := jwt.Parse(authToken, func(*jwt.Token) (interface{}, error) {
				return []byte(""), nil
			})
			if err != nil {
				return err
			}
			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok || claims == nil {
				return errors.New("断言错误")
			}
			fmt.Println(claims["uid"].(float64))
			c.Set("uid", int(claims["uid"].(float64)))
			c.Set("username", claims["username"])
			c.Set("is_admin", int(claims["is_admin"].(float64)))
			return nil
		},
		Unauthorized: func(c echo.Context) error {
			uri := c.Request().RequestURI
			path := fmt.Sprintf("%s?%s=%s", loginURL, RedirectParam, uri)
			return c.JSON(http.StatusOK, map[string]interface{}{
				"error": http.StatusFound,
				"msg":   path,
				"data":  "",
			})
		},
	}
}
