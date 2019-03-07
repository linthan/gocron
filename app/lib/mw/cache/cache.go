// Based on https://github.com/gin-gonic/contrib/cache

package cache

import (
	"bytes"
	"crypto/sha1"
	"errors"
	"fmt"
	"io"
	"net/http"
	"net/url"
	"time"

	"github.com/labstack/echo"
)

const (
	DEFAULT              = time.Duration(0)
	FOREVER              = time.Duration(-1)
	CACHE_MIDDLEWARE_KEY = "hobo-go.echo-mw.cache"
)

var (
	PageCachePrefix = "hobo-go.echo-mw.page.cache"
	ErrCacheMiss    = errors.New("cache: key not found.")
	ErrNotStored    = errors.New("cache: not stored.")
	ErrNotSupport   = errors.New("cache: not support.")
)

type CacheStore interface {
	Get(key string, value interface{}) error
	Set(key string, value interface{}, expire time.Duration) error
	Add(key string, value interface{}, expire time.Duration) error
	Replace(key string, data interface{}, expire time.Duration) error
	Delete(key string) error
	Increment(key string, data uint64) (uint64, error)
	Decrement(key string, data uint64) (uint64, error)
	Flush() error
}

type responseCache struct {
	status int
	header http.Header
	data   []byte
}

type cachedWriter struct {
	writer   http.ResponseWriter
	response *echo.Response
	status   int
	written  bool
	store    CacheStore
	expire   time.Duration
	key      string
}

func urlEscape(prefix string, u string) string {
	key := url.QueryEscape(u)
	if len(key) > 200 {
		h := sha1.New()
		io.WriteString(h, u)
		key = string(h.Sum(nil))
	}
	var buffer bytes.Buffer
	buffer.WriteString(prefix)
	buffer.WriteString(":")
	buffer.WriteString(key)
	return buffer.String()
}

func newCachedWriter(store CacheStore, expire time.Duration, writer http.ResponseWriter, response *echo.Response, key string) *cachedWriter {
	return &cachedWriter{writer, response, 0, false, store, expire, key}
}

func (w *cachedWriter) WriteHeader(code int) {
	w.status = code
	w.written = true
	w.writer.WriteHeader(code)
}

func (w *cachedWriter) Header() http.Header {
	return w.writer.Header()
}

func (w *cachedWriter) Status() int {
	return w.status
}

func (w *cachedWriter) Written() bool {
	return w.written
}

func (w *cachedWriter) Write(data []byte) (int, error) {
	ret, err := w.writer.Write(data)
	if err == nil {
		//cache response
		store := w.store
		header := w.writer.Header()
		// newHeader := http.Header{}
		// for _, k := range header.Keys() {
		// 	fmt.Printf("Cache Write Header %s \n", header.Get(k))
		// 	newHeader.Add(k, header.Get(k))
		// }
		val := responseCache{
			200,
			header,
			data,
		}
		err = store.Set(w.key, val, w.expire)
		if err != nil {
			fmt.Printf("Cache Write Error %s \n", err)
			// need logger
		}
	}
	return ret, err
}

// Cache Middleware
func Cache(store *CacheStore) echo.MiddlewareFunc {
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			c.Set(CACHE_MIDDLEWARE_KEY, store)
			return next(c)
		}
	}
}

//SiteCache  缓存整个目录
func SiteCache(store CacheStore, expire time.Duration) echo.MiddlewareFunc {

	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) error {
			fmt.Printf("Cache Begin")
			var cache responseCache
			uri := c.Request().RequestURI
			key := urlEscape(PageCachePrefix, uri)
			if err := store.Get(key, &cache); err != nil {
				return next(c)
			} else {
				for k, vals := range cache.header {
					for _, v := range vals {
						c.Response().Header().Add(k, v)
					}
				}
				c.Response().WriteHeader(cache.status)
				c.Response().Write(cache.data)
				return nil
			}
		}
	}

}

//Page 缓存页面 Cache Decorator
func Page(store CacheStore, expire time.Duration, handle echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		var cache responseCache
		uri := c.Request().RequestURI
		key := urlEscape(PageCachePrefix, uri)
		//没有命中缓存
		if err := store.Get(key, &cache); err != nil {
			// replace writer
			writer := newCachedWriter(store, expire, c.Response().Writer, c.Response(), key)
			c.Response().Writer = writer
			return handle(c)
		}
		for k, vals := range cache.header {
			for _, v := range vals {
				c.Response().Header().Add(k, v)
			}
		}
		c.Response().WriteHeader(cache.status)
		c.Response().Write(cache.data)
		return nil
	}
}
