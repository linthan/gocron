package log

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"testing"
	"time"

	"github.com/stretchr/testify/assert"
)

// TestZappy_Debug ...
func TestZappy_Debug(t *testing.T) {
	tmpfile, err := ioutil.TempFile(".", "example.*.txt")
	assert.Nil(t, err)

	l := New(WithPath(tmpfile.Name()))
	defer func() {
		assert.Nil(t, l.Close(), "log close failed")
		assert.Nil(t, tmpfile.Close(), "tmpfile close failed")
		assert.Nil(t, os.Remove(tmpfile.Name()), "remove failed")
	}()

	l.Debug("debug", "k", "v", "k1", "v2")
	l.Info("info")
	l.Warn("warn")
	//l.Panic("panic", "k", "v")

	l.SetLevel(InfoLevel)

	l.Debug("debug", "k", "v", "k1", "v2")
	l.Info("info")
	l.Warn("warn")

	l.Infod(
		"test",
		Time("now", time.Now()),
		Int("count", 123),
	)

	l.Error("error")
	defer func() {
		if err := recover(); err != nil {
			l.Error("fatal", "exit", "now")
		}
	}()
	l.Panic("panic")

}

func TestCaller(t *testing.T) {
	tmpfile, err := ioutil.TempFile(".", "example.*.txt")
	assert.Nil(t, err)

	l := New(WithPath(tmpfile.Name()), WithCaller(1))
	defer func() {
		assert.Nil(t, l.Close(), "log close failed")
		assert.Nil(t, tmpfile.Close(), "tmpfile close failed")
		assert.Nil(t, os.Remove(tmpfile.Name()), "remove failed")
	}()

	l.Info("test info")
	l.Sync()

	data, err := ioutil.ReadFile(tmpfile.Name())
	assert.Nil(t, err)

	body := make(map[string]interface{})
	err = json.Unmarshal(data, &body)
	assert.Nil(t, err)

	assert.Equal(t, "test info", body["msg"])
	assert.Equal(t, "info", body["lv"])
	assert.Contains(t, body["caller"], "log/zappy_test.go")
}

func TestCloseAndClean(t *testing.T) {
	tmpfile, err := ioutil.TempFile(".", "example.*.txt")
	assert.Nil(t, err)

	l := New(WithPath(tmpfile.Name()))
	defer func() {
		assert.Nil(t, l.Close(), "log close failed")
		assert.Nil(t, tmpfile.Close(), "tmpfile close failed")
		assert.Nil(t, os.Remove(tmpfile.Name()), "remove failed")
	}()

	l.Info("test info")
	l.Sync()

	data, err := ioutil.ReadFile(tmpfile.Name())
	assert.Nil(t, err)

	body := make(map[string]interface{})
	err = json.Unmarshal(data, &body)
	assert.Nil(t, err)

	assert.Equal(t, "test info", body["msg"])
	assert.Equal(t, "info", body["lv"])
}
