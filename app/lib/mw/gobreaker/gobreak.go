package gobreaker

import (
	"context"
	"fmt"
	"os"
	"runtime"
	"sync"
	"time"

	"github.com/linthan/gocron/log"
)

type runFunc func() error
type fallbackFunc func(error) error

type runFuncC func(context.Context) error
type fallbackFuncC func(context.Context, error) error

// Do runs your function in synchronous manner, blocking until either your function succeeds
// or an error is returned, including circuit errors
func Do(name string, run runFunc, fall fallbackFunc) error {
	return <-Go(name, run, fall)
}

// Go runs your function in asynchronous manner, and returns error chan to the caller
func Go(name string, run runFunc, fall fallbackFunc) <-chan error {
	runC := func(ctx context.Context) error {
		return run()
	}
	var fallC fallbackFuncC
	if fall != nil {
		fallC = func(ctx context.Context, err error) error {
			return fall(err)
		}
	}
	return GoC(context.Background(), name, runC, fallC)
}

// DoC runs your function in synchronous manner, blocking until either your function succeeds
// or an error is returned, including circuit errors
func DoC(ctx context.Context, name string, run runFuncC, fall fallbackFuncC) error {
	return <-GoC(ctx, name, run, fall)
}

// GoC runs your function in asynchronous manner, and returns error chan to the caller
func GoC(ctx context.Context, name string, run runFuncC, fall fallbackFuncC) <-chan error {
	cmd := &command{
		name: name,
		// obtain circuit by name
		circuit: getCircuit(name),
		errChan: make(chan error, 1),
		run:     run,
		fall:    fall,
		start:   time.Now(),
	}

	// ask circuit allow run or not
	done, err := cmd.circuit.Allow()
	if err != nil {
		cmd.errorWithFallback(ctx, err)
		return cmd.errChan
	}

	// Shared by the following two goroutines. It ensures only the faster
	// goroutine runs errorWithFallback().
	once := sync.Once{}
	finished := make(chan struct{}, 1)

	// goroutine 1
	go func() {
		// try recover when run function panics
		defer func() {
			// notify goroutine 2
			finished <- struct{}{}

			if e := recover(); e != nil {
				once.Do(func() {
					done(false)
					cmd.errorWithFallback(ctx, errPanic)

					stack := make([]byte, 1024*8)
					stack = stack[:runtime.Stack(stack, false)]
					fmt.Fprint(os.Stderr, string(stack))
					log.Error("panic", string(stack))
				})
			}
		}()

		// process run function
		err = run(ctx)

		// report run results to circuit
		once.Do(func() {
			done(err == nil)
			cmd.errorWithFallback(ctx, err)
		})
	}()

	// goroutine 2
	go func() {
		select {
		// check if goroutine 1 finished, timeout or error happens
		case <-finished:
		case <-ctx.Done():
			once.Do(func() {
				done(false)
				cmd.errorWithFallback(ctx, ctx.Err())
			})
		}
	}()

	return cmd.errChan
}
