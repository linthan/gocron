package log

import (
	"bufio"
	"time"

	"go.uber.org/zap/zapcore"
)

// bufferWriterSync implements WriterSync interface
type bufferWriterSync struct {
	buf *bufio.Writer
}

// newBufferWriterSync creates writer with lock and buffer
func newBufferWriterSync(ws zapcore.WriteSyncer, size int) zapcore.WriteSyncer {
	if _, ok := ws.(*bufferWriterSync); ok {
		// no need to layer on another buffer
		return ws
	}

	bw := &bufferWriterSync{
		buf: bufio.NewWriterSize(ws, size),
	}

	// bufio is not goroutine safe, so add lock writer here
	ws = zapcore.Lock(bw)

	// flush buffer every 5s
	go func() {
		for range time.NewTicker(5 * time.Second).C {
			ws.Sync()
		}
	}()

	return ws
}

// Sync syncs data to file
func (w bufferWriterSync) Sync() error {
	return w.buf.Flush()
}

// Write writes data to buffer
func (w bufferWriterSync) Write(p []byte) (int, error) {
	// bufio 超过buffer总size时，内部实现逻辑：
	// 1. 没有缓存数据时，会直接写到磁盘
	// 2. 有缓存时，会继续往buffer里面copy数据，直到buffer被填满，再flush
	// 这样可能会导致同一条日志被切割

	// 这里提前flush的话，可以避免这个问题
	// 引入的问题是flush不可控，不是以固定size写入磁盘的
	// 不过从benchmark情况来看，性能差不多
	if len(p) > w.buf.Available() && w.buf.Buffered() > 0 {
		w.buf.Flush()
	}

	return w.buf.Write(p)
}
