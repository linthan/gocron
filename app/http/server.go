package http

import (
	"time"

	"github.com/labstack/echo"
	"github.com/linthan/gocron/app/http/example"
	"github.com/linthan/gocron/app/lib/mw/cache"
	"github.com/linthan/gocron/app/lib/mw/ratelimit"
)

//初始化一个限速中间件
func newRate(wait, dur time.Duration, capacity int64) *ratelimit.RateLimit {
	return ratelimit.New(
		ratelimit.WaitMaxDuration(wait),
		ratelimit.FillInterval(dur),
		ratelimit.Capacity(capacity),
		ratelimit.Message("访问频繁，请稍后再试"))
}

//Mux 添加路由
func Mux(e *echo.Echo) {
	Example(e.Group("/gapi/test/example"))

}

//Example 例子
func Example(g *echo.Group) {
	store := cache.NewInMemoryStore(time.Second)
	g.GET("/hello", cache.Page(store, time.Minute, example.Hello))
	g.POST("/sayHello", example.SayHello, newRate(time.Second, 10*time.Millisecond, 100).Func())
}
