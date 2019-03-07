package log

import (
	"fmt"
	"os"
	"github.com/linthan/gocron/log/rotate"
	"time"

	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// Logger wrap zap
type Logger struct {
	sugar   *zap.SugaredLogger
	desugar *zap.Logger
	Options

	atomicLevel *zap.AtomicLevel

	fields []zapcore.Field

	rl *rotate.Logger
}

// EpochMillisTimeEncoder serializes a time.Time to a floating-point number of
// milliseconds since the Unix epoch.
func timeEncoder(t time.Time, enc zapcore.PrimitiveArrayEncoder) {
	nanos := t.UnixNano()
	millis := float64(nanos) / float64(time.Second)
	enc.AppendString(fmt.Sprintf("%.6f", millis))
}

// New returns new Zappy instance
func New(opts ...Option) *Logger {
	var options = defaultOptions
	for _, opt := range opts {
		opt(&options)
	}

	encoderConfig := zap.NewProductionConfig().EncoderConfig
	encoderConfig.LevelKey = "lv"
	encoderConfig.StacktraceKey = "stack"
	encoderConfig.EncodeCaller = zapcore.ShortCallerEncoder
	encoderConfig.EncodeTime = timeEncoder

	zapOptions := make([]zap.Option, 0)
	zapOptions = append(zapOptions, zap.AddStacktrace(zap.DPanicLevel))
	if options.addCaller {
		zapOptions = append(zapOptions, zap.AddCaller(), zap.AddCallerSkip(options.callerSkip))
	}
	if len(options.fs) > 0 {
		zapOptions = append(zapOptions, zap.Fields(options.fs...))
	}

	var ws zapcore.WriteSyncer
	var rl *rotate.Logger
	if os.Getenv("ECHO_BASE_LOG_DEBUG") == "on" {
		ws = os.Stdout
	} else {
		rotateLog := rotate.NewLogger()
		rotateLog.Filename = options.Filename()
		rotateLog.MaxSize = options.maxSize // MB
		rotateLog.MaxAge = options.maxAge   // days
		rotateLog.MaxBackups = options.maxBackup
		rotateLog.Interval = options.interval
		rotateLog.LocalTime = true
		rotateLog.Compress = false

		rl = rotateLog

		if options.async {
			// bufferSize sizes the buffer associated with each log file. It's large
			// so that log records can accumulate without the logging thread blocking
			// on disk I/O. google glog's buffer size is set to 256*1024.
			// https://github.com/golang/glog/blob/master/glog.go#L857
			ws = newBufferWriterSync(zapcore.AddSync(rotateLog), 128*1024)
		} else {
			ws = zapcore.AddSync(rotateLog)
		}
	}

	lv := zap.NewAtomicLevelAt(options.level)

	core := options.core
	if core == nil {
		core = zapcore.NewCore(
			func() zapcore.Encoder {
				if options.enableConsole {
					return zapcore.NewConsoleEncoder(encoderConfig)
				}

				// 使用console encoder作为压缩的日志输出编码器
				// if os.Getenv("MINERVA_BASE_LOG_COMPACT") == "on" {
				// 	return encode.NewKVPairEncoder(encoderConfig)
				// }
				return zapcore.NewJSONEncoder(encoderConfig)
			}(),
			ws,
			lv,
		)
	}

	logger := zap.New(
		core,
		zapOptions...,
	)

	return &Logger{
		Options:     options,
		atomicLevel: &lv,
		desugar:     logger,
		sugar:       logger.Sugar(),
		rl:          rl,
	}
}

// Sugar return zap sugar logger
func (l *Logger) Sugar() *zap.SugaredLogger {
	return l.sugar
}

// Debugd ...
func (l Logger) Debugd(msg string, fs ...Field) {
	l.desugar.Debug(msg, fs...)
}

// Debug logs debug level messages.
func (l *Logger) Debug(msg string, args ...interface{}) {
	l.sugar.Debugw(msg, args...)
}

// Debugf logs debug level messages in printf-style.
func (l Logger) Debugf(format string, args ...interface{}) {
	l.sugar.Debugf(format, args...)
}

// Infod ...
func (l *Logger) Infod(msg string, fs ...Field) {
	l.desugar.Info(msg, fs...)
}

// Info logs Info level messages in structured-style.
func (l *Logger) Info(msg string, args ...interface{}) {
	l.sugar.Infow(msg, args...)
}

// Infof logs Info level messages in printf-style.
func (l Logger) Infof(format string, args ...interface{}) {
	l.sugar.Infof(format, args...)
}

// Warnd ...
func (l *Logger) Warnd(msg string, fs ...Field) {
	l.desugar.Warn(msg, fs...)
}

// Warn logs Warn level messages in structured-style.
func (l Logger) Warn(msg string, args ...interface{}) {
	// l.Print(WarnLevel, msg, args...)
	l.sugar.Warnw(msg, args...)
}

// Warnf logs Warn level messages in printf-style.
func (l Logger) Warnf(format string, args ...interface{}) {
	l.sugar.Warnf(format, args...)
}

// Errord ...
func (l *Logger) Errord(msg string, fs ...Field) {
	l.desugar.Error(msg, fs...)
}

// Error logs Error level messages in structured-style.
// Notice: additional stack will be added into messages.
func (l Logger) Error(msg string, args ...interface{}) {
	l.sugar.Errorw(msg, args...)
}

// Errorf logs Error level messages in printf-style.
// Notice: additional stack will be added into messages.
func (l Logger) Errorf(format string, args ...interface{}) {
	l.sugar.Errorf(format, args...)
}

// Panicd ...
func (l *Logger) Panicd(msg string, fs ...Field) {
	l.desugar.Panic(msg, fs...)
}

// Panic logs Panic level messages in structured-style.
// Notice: additional stack will be added into messages, meanwhile desugar will panic.
func (l Logger) Panic(msg string, args ...interface{}) {
	l.sugar.Panicw(msg, args...)
}

// Panicf logs Panicf level messages in printf-style.
// Notice: additional stack will be added into messages, meanwhile desugar will panic.
func (l Logger) Panicf(format string, args ...interface{}) {
	l.sugar.Panicf(format, args...)
}

// Fatald ...
func (l *Logger) Fatald(msg string, fs ...Field) {
	l.desugar.Fatal(msg, fs...)
}

// Fatal logs Fatal level messages in structured-style.
// Notice: additional stack will be added into messages, then calls os.Exit(1).
func (l Logger) Fatal(msg string, args ...interface{}) {
	l.sugar.Fatalw(msg, args...)
}

// Fatalf logs Fatalf level messages in printf-style.
// Notice: additional stack will be added into messages, then calls os.Exit(1).
func (l Logger) Fatalf(format string, args ...interface{}) {
	l.sugar.Fatalf(format, args...)
}

// Level 返回日志当前输出等级
func (l Logger) Level() Level {
	return l.atomicLevel.Level()
}

// SetLevel 设置日志输出等级，线程安全
func (l *Logger) SetLevel(lv Level) *Logger {
	l.atomicLevel.SetLevel(lv)
	return l
}

// SetLevelString 设置日志输出等级，线程安全
func (l *Logger) SetLevelString(ls string) *Logger {
	l.atomicLevel.SetLevel(minLevel(ls))
	return l
}

// SetDefaultFields 设置默认字段
// 非线程安全，初始化logger的时候使用
func (l *Logger) SetDefaultFields(fs ...Field) *Logger {
	l.fields = append(l.fields, fs...)
	return l
}

func (l *Logger) clone() *Logger {
	cloned := *l
	return &cloned
}

// WithFields ...
func (l *Logger) WithFields(fs ...Field) *Logger {
	cloned := l.clone()
	cloned.sugar = cloned.sugar.With(fs)
	cloned.desugar = cloned.desugar.With(fs...)
	return cloned
}

// SetDefaultDir 设置默认输出目录
// 非线程安全，初始化logger的时候使用
func (l *Logger) SetDefaultDir(dir string) *Logger {
	l.Options.dir = dir
	return l
}

// Sync flushes buffer data into disk
func (l *Logger) Sync() {
	l.sugar.Sync()
	l.desugar.Sync()
}

// Close flushes buffer and closes logger fd
func (l *Logger) Close() error {
	l.Sync()

	if l.rl != nil {
		return l.rl.Close()
	}

	return nil
}
