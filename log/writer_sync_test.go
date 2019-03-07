package log

import (
	"encoding/json"
	"io/ioutil"
	"os"
	"strings"
	"testing"

	"github.com/stretchr/testify/assert"
	"go.uber.org/zap"
)

func TestWriterBufferSync(t *testing.T) {
	tmpfile, err := ioutil.TempFile(".", "example.*.txt")
	assert.Nil(t, err)

	defer os.Remove(tmpfile.Name())
	defer tmpfile.Close()

	logger, f := newZapLoggerBuffer(tmpfile.Name(), zap.DebugLevel, 70)
	defer f.Close()

	logger.Info("12345678")

	// 日志内容在缓存，读取数据为空
	data, err := ioutil.ReadFile(tmpfile.Name())
	assert.Nil(t, err)
	assert.Len(t, data, 0)

	// 超过缓存size 70，12345678先写入磁盘
	logger.Info("90")

	data, err = ioutil.ReadFile(tmpfile.Name())
	assert.Nil(t, err)

	t.Log(string(data))

	body := make(map[string]interface{})
	err = json.Unmarshal(data, &body)
	assert.Equal(t, "12345678", body["msg"])

	// 超过缓存size 70，90再写入磁盘
	logger.Info("12345678")

	data, err = ioutil.ReadFile(tmpfile.Name())
	assert.Nil(t, err)

	ss := strings.Split(string(data), "\n")
	assert.Len(t, ss, 3)

	body = make(map[string]interface{})
	err = json.Unmarshal([]byte(ss[1]), &body)
	assert.Nil(t, err)
	assert.Equal(t, "90", body["msg"])

	logger.Sync()

	data, err = ioutil.ReadFile(tmpfile.Name())
	assert.Nil(t, err)

	ss = strings.Split(string(data), "\n")
	assert.Len(t, ss, 4)

	body = make(map[string]interface{})
	err = json.Unmarshal([]byte(ss[2]), &body)
	assert.Nil(t, err)
	assert.Equal(t, "12345678", body["msg"])
}
