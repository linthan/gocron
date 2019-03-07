package caller

import (
	"errors"

	"github.com/fsnotify/fsnotify"
	"github.com/spf13/viper"
)

func init() {
	viper.OnConfigChange(func(e fsnotify.Event) {
		Reload()
	})
}

// Options 配置callerx
type Options struct {
}

// Option 配置callerx的函数
type Option func(*Options)

// Caller 抽象接口
// 基于配置生成各类单例，并管理其生命周期
type Caller interface {
	Init(opts ...Option) error
	Reload(opts ...Option) error
	Close(opts ...Option) error
}

// Base 基础接口
type Base struct{}

// Init caller初始化接口
func (*Base) Init(opts ...Option) error {
	return errors.New("init not implemented")
}

// Reload caller热更新接口
func (*Base) Reload(opts ...Option) error {
	return errors.New("reload not implemented")
}

// Close caller退出接口
func (*Base) Close(opts ...Option) error {
	return errors.New("close not implemented")
}

var callers []Caller

// Register caller注册具体实现
func Register(ivk ...Caller) {
	callers = append(callers, ivk...)
}

// Init caller执行初始化具体实现
func Init(opts ...Option) error {
	for _, caller := range callers {
		caller.Init(opts...)
	}

	return nil
}

// Reload caller执行热更新具体实现
func Reload(opts ...Option) error {
	for _, caller := range callers {
		caller.Reload(opts...)
	}

	return nil
}

// Close caller执行退出具体实现
func Close(opts ...Option) error {
	for _, caller := range callers {
		caller.Close(opts...)
	}

	return nil
}
