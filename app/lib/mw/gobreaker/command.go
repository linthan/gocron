package gobreaker

import (
	"context"
	"errors"
	"time"

	"github.com/linthan/gocron/log"
	"github.com/sony/gobreaker"
)

type command struct {
	name    string
	circuit *gobreaker.TwoStepCircuitBreaker
	errChan chan error
	run     runFuncC
	fall    fallbackFuncC
	start   time.Time
}

var (
	// errPanic is returned when goroutine panics
	errPanic = errors.New("command panics")
)

// errorWithFallback process error and fallback logic, with prometheus metrics
func (c *command) errorWithFallback(ctx context.Context, err error) {
	elsaped := int64(time.Since(c.start).Round(time.Microsecond) / time.Millisecond)
	// run returns nil means everything is ok
	if err == nil {
		c.errChan <- nil
		return
	}
	// collect metrics and log only for errors
	log.Error("errorWithFallback started", "name", c.name, "error", err, "elasped", elsaped)

	// return err directly when no fallback found
	if c.fall == nil {
		c.errChan <- err
		return
	}

	// fallback and return err
	err = c.fall(ctx, err)
	c.errChan <- err

	if err != nil {
		return
	}
}

func errorToEvent(err error) string {
	event := "failure"
	switch err {
	case nil:
		event = "success"
	case context.DeadlineExceeded:
		event = "context-deadline-exceeded"
	case context.Canceled:
		event = "context-cancled"
	case gobreaker.ErrTooManyRequests:
		event = "too-many-requests"
	case gobreaker.ErrOpenState:
		event = "circuit-open"
	case errPanic:
		event = "panic"
	}

	return event
}
