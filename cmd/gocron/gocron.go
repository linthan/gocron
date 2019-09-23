// Command gocron
//go:generate statik -src=../../web/public -dest=../../internal -f

package main

import (
	"os"
	"os/signal"
	"syscall"

	"github.com/linthan/gocron/internal/models"
	"github.com/linthan/gocron/internal/modules/app"
	"github.com/linthan/gocron/internal/modules/logger"
	"github.com/linthan/gocron/internal/modules/setting"
	"github.com/linthan/gocron/internal/routers"
	"github.com/linthan/gocron/internal/service"
	"github.com/ouqiang/goutil"
	"github.com/urfave/cli"
	"gopkg.in/macaron.v1"
)

var (
	AppVersion           = "1.5"
	BuildDate, GitCommit string
)

// web服务器默认端口
const DefaultPort = 60027

func main() {
	cliApp := cli.NewApp()
	cliApp.Name = "gocron"
	cliApp.Usage = "gocron service"
	cliApp.Version, _ = goutil.FormatAppVersion(AppVersion, GitCommit, BuildDate)
	cliApp.Commands = getCommands()
	cliApp.Flags = append(cliApp.Flags, []cli.Flag{}...)
	cliApp.Run(os.Args)
}

// getCommands
func getCommands() []cli.Command {
	command := cli.Command{
		Name:   "web",
		Usage:  "run web server",
		Action: runWeb,
		Flags: []cli.Flag{
			cli.StringFlag{
				Name:  "host",
				Value: "0.0.0.0",
				Usage: "bind host",
			},
			cli.IntFlag{
				Name:  "port,p",
				Value: DefaultPort,
				Usage: "bind port",
			},
			cli.StringFlag{
				Name:  "env,e",
				Value: "prod",
				Usage: "runtime environment, dev|test|prod",
			},
		},
	}

	return []cli.Command{command}
}

func runWeb(ctx *cli.Context) {
	// 设置运行环境
	setEnvironment(ctx)
	// 初始化应用
	app.InitEnv(AppVersion)

	// 初始化模块 DB、定时任务等
	initModule()
	// 捕捉信号,配置热更新等
	go catchSignal()
	m := macaron.Classic()
	// 注册路由
	routers.Register(m)
	// 注册中间件.
	routers.RegisterMiddleware(m)
	host := parseHost(ctx)
	port := parsePort(ctx)
	if app.IsInstalled() {
		service.Init()
	}
	m.Run(host, port)
}

func initModule() {
	if !app.Installed {
		return
	}

	config, err := setting.Read(app.AppConfig)
	if err != nil {
		logger.Fatal("读取应用配置失败", err)
	}
	app.Setting = config

	// 初始化DB
	models.Db = models.CreateDb()

	// 版本升级
	upgradeIfNeed()

	// 初始化定时任务
	service.TaskSrv.Initialize()
}

// 解析端口
func parsePort(ctx *cli.Context) int {
	port := DefaultPort
	if ctx.IsSet("port") {
		port = ctx.Int("port")
	}
	if port <= 0 || port >= 65535 {
		port = DefaultPort
	}

	return port
}

func parseHost(ctx *cli.Context) string {
	if ctx.IsSet("host") {
		return ctx.String("host")
	}

	return "0.0.0.0"
}

func setEnvironment(ctx *cli.Context) {
	env := "prod"
	if ctx.IsSet("env") {
		env = ctx.String("env")
	}

	switch env {
	case "test":
		macaron.Env = macaron.TEST
	case "dev":
		macaron.Env = macaron.DEV
	default:
		macaron.Env = macaron.PROD
	}
}

// 捕捉信号
func catchSignal() {
	c := make(chan os.Signal)
	// todo 配置热更新, windows 不支持 syscall.SIGUSR1, syscall.SIGUSR2
	signal.Notify(c, syscall.SIGHUP, syscall.SIGINT, syscall.SIGTERM)
	for {
		s := <-c
		logger.Info("收到信号 -- ", s)
		switch s {
		case syscall.SIGHUP:
			logger.Info("收到终端断开信号, 忽略")
		case syscall.SIGINT, syscall.SIGTERM:
			shutdown()
		}
	}
}

// 应用退出
func shutdown() {
	defer func() {
		logger.Info("已退出")
		os.Exit(0)
	}()

	if !app.Installed {
		return
	}
	logger.Info("应用准备退出")
	// 停止所有任务调度
	logger.Info("停止定时任务调度")
	service.TaskSrv.WaitAndExit()
}

// 判断应用是否需要升级, 当存在版本号文件且版本小于app.VersionId时升级
func upgradeIfNeed() {
	currentVersionID := app.GetCurrentVersionID()
	// 没有版本号文件
	if currentVersionID == 0 {
		return
	}
	if currentVersionID >= app.VersionID {
		return
	}

	migration := new(models.Migration)
	logger.Infof("版本升级开始, 当前版本号%d", currentVersionID)

	migration.Upgrade(currentVersionID)
	app.UpdateVersionFile()

	logger.Infof("已升级到最新版本%d", app.VersionID)
}
