package log

import (
	"fmt"
	"reflect"
	"runtime"
	"strings"
	"time"

	"go.uber.org/zap/zapcore"
)

// Option ...
type (
	Option  func(*Options)
	Options struct {
		dir           string
		path          string
		enableConsole bool
		level         Level
		name          string
		fs            []Field
		addCaller     bool
		prefix        string
		maxSize       int
		maxAge        int
		maxBackup     int
		interval      time.Duration
		callerSkip    int
		async         bool
		core          zapcore.Core
	}
)

// DefaultOptions ...
func DefaultOptions() Options {
	return Options{
		name:          "default",
		dir:           ".",
		level:         InfoLevel,
		maxSize:       500, // 500M
		maxAge:        1,   // 1 day
		maxBackup:     10,  // 10 backup
		interval:      24 * time.Hour,
		callerSkip:    1,
		addCaller:     false,
		enableConsole: false,
		async:         true,
	}
}

var defaultOptions = Options{
	name:          "default",
	dir:           ".",
	level:         InfoLevel,
	maxSize:       500, // 500M
	maxAge:        1,   // 1 day
	maxBackup:     10,  // 10 backup
	interval:      24 * time.Hour,
	callerSkip:    1,
	addCaller:     false,
	enableConsole: false,
	async:         true,
}

// WithRotateConfig 设置轮转配置，
func WithRotateConfig(maxSize, maxAge, maxBackup int) Option {
	return func(o *Options) {
		o.maxSize = maxSize
		o.maxAge = maxAge
		o.maxBackup = maxBackup
	}
}

// WithCalller 打印caller信息
func WithCaller(skip int) Option {
	return func(o *Options) {
		o.addCaller = true
		o.callerSkip = skip
	}
}

// WithName option
func WithName(name string) Option {
	return func(o *Options) {
		o.name = name
	}
}

// WithFields adds fields to the Logger.
func WithFields(fs ...Field) Option {
	return func(o *Options) {
		o.fs = fs
	}
}

// WithPath dir/file
func WithPath(path string) Option {
	return func(options *Options) {
		options.path = path
	}
}

// WithDirectory log directory
func WithDirectory(dir string) Option {
	return func(options *Options) {
		if strings.HasSuffix(dir, "/") {
			dir = dir[:len(dir)-1]
		}
		options.dir = dir
	}
}

// WithLevel configures desugar minimum level.
func WithLevel(lvFn func(string, ...interface{})) Option {
	name := runtime.FuncForPC(reflect.ValueOf(lvFn).Pointer()).Name()
	return func(o *Options) {
		o.level = minLevel(name)
	}
}

// WithLevelCombo 设置level掩码
func WithLevelCombo(lc string) Option {
	return func(options *Options) {
		options.level = parseLevel(lc, "|")
	}
}

// Deprecated use WithLevelCombo instead
func WithLevelString(ls string) Option {
	return func(options *Options) {
		options.level = parseLevel(ls, "|")
	}
}

// Deprecated
func WithPrefix(prefix string) Option {
	return func(options *Options) {
		options.prefix = prefix
	}
}

// WithEnableConsole ...
func WithEnableConsole(enable bool) Option {
	return func(o *Options) {
		o.enableConsole = enable
	}
}

// WithInterval means the interval to rotate log files
func WithInterval(interval time.Duration) Option {
	return func(o *Options) {
		o.interval = interval
	}
}

// Filename ...
func (options Options) Filename() string {
	path := options.path
	dir := options.dir
	name := options.name

	if path == "" {
		path = fmt.Sprintf("%s/%s.json", dir, name)
	}

	return path
}

func parseLevel(desc string, delim string) (level Level) {
	lvs := strings.Split(strings.TrimSpace(desc), delim)
	if len(lvs) == 0 {
		return InfoLevel
	}

	return levelMap(lvs[0])
}

func levelMap(lvl string) (lv Level) {
	level := strings.ToUpper(strings.TrimSpace(lvl))
	switch level[:4] {
	case "DEBU":
		lv = DebugLevel
	case "INFO":
		lv = InfoLevel
	case "WARN":
		lv = WarnLevel
	case "ERRO":
		lv = ErrorLevel
	case "PANI":
		lv = PanicLevel
	case "FATA":
		lv = FatalLevel
	default:
		lv = InfoLevel
	}

	return
}
func minLevel(mlv string) (level Level) {
	lower := strings.ToLower(mlv)
	switch {
	case strings.HasSuffix(lower, "debug"):
		level = DebugLevel
	case strings.HasSuffix(lower, "info"):
		level = InfoLevel
	case strings.HasSuffix(lower, "warn"):
		level = WarnLevel
	case strings.HasSuffix(lower, "error"):
		level = ErrorLevel
	case strings.HasSuffix(lower, "panic"):
		level = PanicLevel
	case strings.HasSuffix(lower, "fatal"):
		level = FatalLevel
	}
	return
}

// Deprecate
func WithColorful(bool) Option {
	return func(*Options) {}
}

// WithAsync use async writer
func WithAsync(async bool) Option {
	return func(o *Options) {
		o.async = async
	}
}

// Deprecate
func WithOutput(...Option) Option {
	return func(*Options) {}
}

// Deprecate
func WithOutputKV(map[string]interface{}) Option {
	return func(*Options) {}
}

// Deprecate
func WithOutputKVs([]interface{}) Option {
	return func(*Options) {}
}

// WithCore uses specified core to create log,
// very useful for unit test
func WithCore(core zapcore.Core) Option {
	return func(o *Options) {
		o.core = core
	}
}
