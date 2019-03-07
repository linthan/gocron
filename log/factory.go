package log

import (
	"sync"
	"github.com/linthan/gocron/version"
)

var (
	logger  *Logger
	loggers sync.Map
)

func init() {
	logger = Log("default")
}

//Log 定义logger的名字
func Log(name string) *Logger {
	if ret, ok := loggers.Load(name); ok {
		return ret.(*Logger)
	}

	logger := newLog(name)
	loggers.Store(name, logger)
	return logger
}

func newLog(name string) *Logger {
	return New(
		WithName(name),
		WithDirectory(version.LogDir()),
		WithFields(
			String("aid", version.ID()),
			String("iid", version.UUID()),
		),
	)
}

// Sync flushes all logger's buffer data into disk
func Sync() {
	loggers.Range(func(key, value interface{}) bool {
		l, ok := value.(*Logger)
		if ok {
			l.Sync()
		}
		return true
	})
}

// Close flushes all logger's buffer data into disk
func Close() error {
	loggers.Range(func(key, value interface{}) bool {
		l, ok := value.(*Logger)
		if ok {
			l.Sync()
			l.Close()
		}
		return true
	})
	return nil
}
