package log

import (
	"go.uber.org/zap/zapcore"
)

// Debugd ...
func Debugd(msg string, fs ...Field) {
	logger.Debugd(msg, fs...)
}

// Debug logs debug level messages with default desugar.
func Debug(msg string, args ...interface{}) {
	logger.Debug(msg, args...)
}

// Debugf logs debug level messages with default desugar in printf-style.
func Debugf(format string, args ...interface{}) {
	logger.Debugf(format, args...)
}

// Infod ...
func Infod(msg string, fs ...Field) {
	logger.Infod(msg, fs...)
}

// Info logs Info level messages with default desugar in structured-style.
func Info(msg string, args ...interface{}) {
	logger.Info(msg, args...)
}

// Infof logs Info level messages with default desugar in printf-style.
func Infof(format string, args ...interface{}) {
	logger.Infof(format, args...)
}

// Warnd ...
func Warnd(msg string, fs ...Field) {
	logger.Warnd(msg, fs...)
}

// Warn logs Warn level messages with default desugar in structured-style.
func Warn(msg string, args ...interface{}) {
	logger.Warn(msg, args...)
}

// Warnf logs Warn level messages with default desugar in printf-style.
func Warnf(format string, args ...interface{}) {
	logger.Warnf(format, args...)
}

// Errord ...
func Errord(msg string, fs ...Field) {
	logger.Errord(msg, fs...)
}

// Error logs Error level messages with default desugar in structured-style.
// Notice: additional stack will be added into messages.
func Error(msg string, args ...interface{}) {
	logger.Error(msg, args...)
}

// Errorf logs Error level messages with default desugar in printf-style.
// Notice: additional stack will be added into messages.
func Errorf(format string, args ...interface{}) {
	logger.Errorf(format, args...)
}

// Panicd ...
func Panicd(msg string, fs ...Field) {
	logger.Panicd(msg, fs...)
}

// Panic logs Panic level messages with default desugar in structured-style.
// Notice: additional stack will be added into messages, meanwhile desugar will panic.
func Panic(msg string, args ...interface{}) {
	logger.Panic(msg, args...)
}

// Panicf logs Panicf level messages with default desugar in printf-style.
// Notice: additional stack will be added into messages, meanwhile desugar will panic.
func Panicf(format string, args ...interface{}) {
	logger.Panicf(format, args...)
}

// Fatald ...
func Fatald(msg string, fs ...Field) {
	logger.Fatald(msg, fs...)
}

// Fatal logs Fatal level messages with default desugar in structured-style.
// Notice: additional stack will be added into messages, then calls os.Exit(1).
func Fatal(msg string, args ...interface{}) {
	logger.Fatal(msg, args...)
}

// Fatalf logs Fatalf level messages with default desugar in printf-style.
// Notice: additional stack will be added into messages, then calls os.Exit(1).
func Fatalf(format string, args ...interface{}) {
	logger.Fatalf(format, args...)
}

// SetDefaultFields ...
func SetDefaultFields(fs ...zapcore.Field) *Logger {
	return logger.SetDefaultFields(fs...)
}

// SetDefaultDir ...
func SetDefaultDir(dir string) *Logger {
	return logger.SetDefaultDir(dir)
}

// SetLevel ...
func SetLevel(lv Level) *Logger {
	return logger.SetLevel(lv)
}

// Deprecated: use Log("default").Set*() instead
func SetDefaultLogger(l *Logger) {
}
