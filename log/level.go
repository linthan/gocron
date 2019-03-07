package log

import (
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

// A Level is a logging priority. Higher levels are more important.
const (
	// DebugLevel logs are typically voluminous, and are usually disabled in
	// production.
	DebugLevel = zap.DebugLevel
	// InfoLevel is the default logging priority.
	InfoLevel = zap.InfoLevel
	// WarnLevel logs are more important than Info, but don't need individual
	// human review.
	WarnLevel = zap.WarnLevel
	// ErrorLevel logs are high-priority. If an application is running smoothly,
	// it shouldn't generate any error-Level logs.
	ErrorLevel = zap.ErrorLevel
	// PanicLevel logs a message, then panics.
	PanicLevel = zap.PanicLevel
	// FatalLevel logs a message, then calls os.Exit(1).
	FatalLevel = zap.FatalLevel
)

//alias
type (
	Field = zap.Field
	Level = zapcore.Level
)

//define the package variables
var (
	Skip       = zap.Skip
	Binary     = zap.Binary
	Bool       = zap.Bool
	ByteString = zap.ByteString
	Complex128 = zap.Complex128
	Complex64  = zap.Complex64
	Float64    = zap.Float64
	Float32    = zap.Float32
	Int        = zap.Int
	Int32      = zap.Int32
	Int64      = zap.Int64
	Int16      = zap.Int16
	Int8       = zap.Int8
	String     = zap.String
	Uint       = zap.Uint
	Uint64     = zap.Uint64
	Uint32     = zap.Uint32
	Uint16     = zap.Uint16
	Uint8      = zap.Uint8
	Uintptr    = zap.Uintptr
	Reflect    = zap.Reflect
	Namespace  = zap.Namespace
	Stringer   = zap.Stringer
	Time       = zap.Time
	Stack      = zap.Stack
	Duration   = zap.Duration
	Object     = zap.Object
	Any        = zap.Any
)
