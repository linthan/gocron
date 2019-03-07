package log

import (
	"errors"
	"fmt"
	"io/ioutil"
	"os"
	"github.com/linthan/gocron/log/rotate"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"
	"go.uber.org/zap/zapcore"
)

var (
	errExample = errors.New("fail")

	_messages   = fakeMessages(1000)
	_tenInts    = []int{1, 2, 3, 4, 5, 6, 7, 8, 9, 0}
	_tenStrings = []string{"a", "b", "c", "d", "e", "f", "g", "h", "i", "j"}
	_tenTimes   = []time.Time{
		time.Unix(0, 0),
		time.Unix(1, 0),
		time.Unix(2, 0),
		time.Unix(3, 0),
		time.Unix(4, 0),
		time.Unix(5, 0),
		time.Unix(6, 0),
		time.Unix(7, 0),
		time.Unix(8, 0),
		time.Unix(9, 0),
	}
	_oneUser = &user{
		Name:      "Jane Doe",
		Email:     "jane@test.com",
		CreatedAt: time.Date(1980, 1, 1, 12, 0, 0, 0, time.UTC),
	}
	_tenUsers = users{
		_oneUser,
		_oneUser,
		_oneUser,
		_oneUser,
		_oneUser,
		_oneUser,
		_oneUser,
		_oneUser,
		_oneUser,
		_oneUser,
	}
)

type users []*user

func (uu users) MarshalLogArray(arr zapcore.ArrayEncoder) error {
	var err error
	for i := range uu {
		err = arr.AppendObject(uu[i])
	}
	return err
}

type user struct {
	Name      string    `json:"name"`
	Email     string    `json:"email"`
	CreatedAt time.Time `json:"created_at"`
}

func (u *user) MarshalLogObject(enc zapcore.ObjectEncoder) error {
	enc.AddString("name", u.Name)
	enc.AddString("email", u.Email)
	enc.AddInt64("createdAt", u.CreatedAt.UnixNano())
	return nil
}

func fakeMessages(n int) []string {
	messages := make([]string, n)
	for i := range messages {
		messages[i] = fmt.Sprintf("Test logging, but use a somewhat realistic message length. (#%v)", i)
	}
	return messages
}

func getMessage(iter int) string {
	return _messages[iter%1000]
}

func fakeFields() []zap.Field {
	return []zap.Field{
		zap.Int("int", _tenInts[0]),
		zap.Ints("ints", _tenInts),
		zap.String("string", _tenStrings[0]),
		zap.Strings("strings", _tenStrings),
		zap.Time("time", _tenTimes[0]),
		zap.Times("times", _tenTimes),
		zap.Object("user1", _oneUser),
		zap.Object("user2", _oneUser),
		zap.Array("users", _tenUsers),
		zap.Error(errExample),
	}
}

func fakeSugarFields() []interface{} {
	return []interface{}{
		"int", _tenInts[0],
		"ints", _tenInts,
		"string", _tenStrings[0],
		"strings", _tenStrings,
		"time", _tenTimes[0],
		"times", _tenTimes,
		"user1", _oneUser,
		"user2", _oneUser,
		"users", _tenUsers,
		"error", errExample,
	}
}

func newZapLoggerFile(name string, lvl zapcore.Level) (*zap.Logger, *rotate.Logger) {
	ec := zap.NewProductionEncoderConfig()
	ec.EncodeDuration = zapcore.NanosDurationEncoder
	ec.EncodeTime = zapcore.EpochNanosTimeEncoder
	enc := zapcore.NewJSONEncoder(ec)
	f := &rotate.Logger{
		Filename:   name,
		MaxSize:    10240, // megabytes
		MaxBackups: 3,
		MaxAge:     28,   // days
		Compress:   true, // disabled by default
	}

	bw := zapcore.AddSync(f)
	return zap.New(zapcore.NewCore(
		enc,
		bw,
		lvl,
	)), f
}

func newZapLoggerBuffer(name string, lvl zapcore.Level, size int) (*zap.Logger, *rotate.Logger) {
	ec := zap.NewProductionEncoderConfig()
	ec.EncodeDuration = zapcore.NanosDurationEncoder
	ec.EncodeTime = zapcore.EpochNanosTimeEncoder
	enc := zapcore.NewJSONEncoder(ec)
	f := &rotate.Logger{
		Filename:   name,
		MaxSize:    10240, // megabytes
		MaxBackups: 3,
		MaxAge:     28,   // days
		Compress:   true, // disabled by default
	}

	bw := newBufferWriterSync(zapcore.AddSync(f), size)
	return zap.New(zapcore.NewCore(
		enc,
		bw,
		lvl,
	)), f
}

func BenchmarkNewZapLogger(b *testing.B) {
	b.Run("Zap.NoBuffer", func(b *testing.B) {
		tmpfile, err := ioutil.TempFile(".", "example.*.txt")
		assert.Nil(b, err)

		defer os.Remove(tmpfile.Name())
		defer tmpfile.Close()

		logger, f := newZapLoggerFile(tmpfile.Name(), zap.DebugLevel)
		defer f.Close()

		b.ResetTimer()
		b.RunParallel(func(pb *testing.PB) {
			for pb.Next() {
				logger.With(fakeFields()...).Info(getMessage(0))
			}
		})
	})

	b.Run("Zap.SugarNoBuffer", func(b *testing.B) {
		tmpfile, err := ioutil.TempFile(".", "example.*.txt")
		assert.Nil(b, err)

		defer os.Remove(tmpfile.Name())
		defer tmpfile.Close()

		logger, f := newZapLoggerFile(tmpfile.Name(), zap.DebugLevel)
		defer f.Close()

		sugar := logger.Sugar()

		b.ResetTimer()
		b.RunParallel(func(pb *testing.PB) {
			for pb.Next() {
				sugar.Infow(getMessage(0), fakeSugarFields())
			}
		})
	})

	b.Run("Zap.Buffer1b", func(b *testing.B) {
		tmpfile, err := ioutil.TempFile(".", "example.*.txt")
		assert.Nil(b, err)

		defer os.Remove(tmpfile.Name())
		defer tmpfile.Close()

		logger, f := newZapLoggerBuffer(tmpfile.Name(), zap.DebugLevel, 1)
		defer f.Close()
		b.ResetTimer()

		b.RunParallel(func(pb *testing.PB) {
			for pb.Next() {
				logger.With(fakeFields()...).Info(getMessage(0))
			}
		})
	})

	b.Run("Zap.Buffer4k", func(b *testing.B) {
		tmpfile, err := ioutil.TempFile(".", "example.*.txt")
		assert.Nil(b, err)

		defer os.Remove(tmpfile.Name())
		defer tmpfile.Close()

		logger, f := newZapLoggerBuffer(tmpfile.Name(), zap.DebugLevel, 4*1024)
		defer f.Close()

		b.ResetTimer()

		b.RunParallel(func(pb *testing.PB) {
			for pb.Next() {
				logger.With(fakeFields()...).Info(getMessage(0))
			}
		})
	})

	b.Run("Zap.Buffer128k", func(b *testing.B) {
		tmpfile, err := ioutil.TempFile(".", "example.*.txt")
		assert.Nil(b, err)

		defer os.Remove(tmpfile.Name())
		defer tmpfile.Close()

		logger, f := newZapLoggerBuffer(tmpfile.Name(), zap.DebugLevel, 128*1024)
		defer f.Close()

		b.ResetTimer()

		b.RunParallel(func(pb *testing.PB) {
			for pb.Next() {
				logger.With(fakeFields()...).Info(getMessage(0))
			}
		})
	})

	b.Run("Zap.Buffer256k", func(b *testing.B) {
		tmpfile, err := ioutil.TempFile(".", "example.*.txt")
		assert.Nil(b, err)

		defer os.Remove(tmpfile.Name())
		defer tmpfile.Close()

		logger, f := newZapLoggerBuffer(tmpfile.Name(), zap.DebugLevel, 256*1024)
		defer f.Close()

		b.ResetTimer()

		b.RunParallel(func(pb *testing.PB) {
			for pb.Next() {
				logger.With(fakeFields()...).Info(getMessage(0))
			}
		})
	})
}
