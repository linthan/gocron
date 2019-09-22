package web

import (
	"fmt"

	"github.com/labstack/echo"
	"github.com/linthan/gocron/app/caller"
	"github.com/linthan/gocron/app/http"
	"github.com/linthan/gocron/app/service"
	echopprof "github.com/sevenNt/echo-pprof"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

var host string

//WebCmd  represents the web command
var WebCmd = &cobra.Command{
	Use:   "web",
	Short: "web",
	Long:  `web`,
	Run: func(cmd *cobra.Command, args []string) {
		e := echo.New()
		caller.Init()
		//初始化服务
		service.Init()
		//添加路由
		echopprof.Wrap(e)
		http.Mux(e)
		echopprof.Wrap(e)
		e.Logger.Fatal(e.Start(fmt.Sprintf("%s:%s", host, viper.GetString("server.http.port"))))
	},
}

//init 初始化
func init() {
	WebCmd.PersistentFlags().StringVar(&host, "host", "0.0.0.0", "host default is 0.0.0.0")
}
