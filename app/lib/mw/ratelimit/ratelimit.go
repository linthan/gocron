package ratelimit

import (
	"errors"
	"net/http"

	jratelimit "github.com/juju/ratelimit"
	"github.com/labstack/echo"
)

var (
	// ErrRateLimitTooMany too many request error.
	ErrRateLimitTooMany = errors.New("[ratelimit] too many request")
)

// RateLimit rate limit
type RateLimit struct {
	Options
}

// New constructs a new rateLimit interceptor.
func New(opts ...Option) *RateLimit {
	var options Options
	for _, opt := range opts {
		opt(&options)
	}
	return &RateLimit{
		Options: options,
	}
}

// Func implements HTTP Middleware interface.
func (r *RateLimit) Func() echo.MiddlewareFunc {
	rt := jratelimit.NewBucket(r.interval, r.capacity)
	return func(next echo.HandlerFunc) echo.HandlerFunc {
		return func(c echo.Context) (err error) {
			if _, wait := rt.TakeMaxDuration(1, r.waitMaxDuration); !wait {
				return c.JSON(http.StatusOK, map[string]interface{}{
					"err":  1,
					"mgs":  r.msg,
					"data": "",
				})
			}
			return next(c)
		}
	}
}

// Label implements HTTP Middleware interface.
func (r *RateLimit) Label() string {
	return "echo-plugin-ratelimit"
}
