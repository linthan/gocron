package version

import (
	"crypto/md5"
	"fmt"
	"os"
	"runtime"
)

var (
	name     string
	hostname string
	label    string
	id       string
)

func init() {
	label = fmt.Sprintf("%s", name)
	hn, err := os.Hostname()
	if err != nil {
		hostname = "unknown"
	} else {
		hostname = hn
	}
}

//GitCommit The git commit that was compiled. This will be filled in by the compiler.
var GitCommit string

//Version The main version number that is being run at the moment.
const Version = "0.1.0"

//BuildDate 构建时间
var BuildDate = ""

//GoVersion golang的版本
var GoVersion = runtime.Version()

//OsArch golang的架构
var OsArch = fmt.Sprintf("%s %s", runtime.GOOS, runtime.GOARCH)

// LogDir return log dir
func LogDir() string {
	// LogDir gets application log directory.
	logDir := os.Getenv("ECHO_BASE_LOG_DIR")
	if logDir == "" {
		if os.Getenv("POD_IP") != "" {
			// k8s 环境
			return fmt.Sprintf("/home/www/logs/%s", os.Getenv("POD_NAME"))
		}
		return fmt.Sprintf("/home/www/logs/applogs/%s/%s/", Name(), UUID())
	}
	return fmt.Sprintf("%s/%s/%s/", logDir, Name(), UUID())
}

//Name 名称
func Name() string {
	if name == "" {
		return "echotest"
	}
	return name
}

//Hostname 主机名
func Hostname() string {
	return hostname
}

//UUID 用户ID
func UUID() string {
	return fmt.Sprintf("%x", md5.Sum([]byte(fmt.Sprintf("%s:%s", Hostname(), ID()))))
}

//PID 程的pid
func PID() int {
	return os.Getpid()
}

//ID 用户ID
func ID() string {
	if id == "" {
		id = "1234567890"
	}
	return id
}
