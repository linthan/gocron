package cache

import (
	"net/http"

	"github.com/labstack/echo"
)

type myWriter struct {
	Writer   http.ResponseWriter
	response *echo.Response
}

func (w *myWriter) WriteHeader(code int) {
	w.Writer.WriteHeader(code)
}

func (w *myWriter) Write(data []byte) (int, error) {
	return w.Writer.Write(data)
}
func (w *myWriter) Header() http.Header {
	return w.Writer.Header()
}
