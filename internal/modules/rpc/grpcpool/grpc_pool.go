package grpcpool

import (
	"errors"
	"strings"
	"sync"
	"time"

	"github.com/linthan/gocron/internal/modules/app"
	"github.com/linthan/gocron/internal/modules/rpc/auth"
	"github.com/silenceper/pool"
	"google.golang.org/grpc"
)

var (
	Pool GRPCPool
)

var (
	ErrInvalidConn = errors.New("invalid connection")
)

func init() {
	Pool = GRPCPool{
		make(map[string]pool.Pool),
		sync.RWMutex{},
	}
}

type GRPCPool struct {
	// map key格式 ip:port
	conns map[string]pool.Pool
	sync.RWMutex
}

func (p *GRPCPool) Get(addr string) (*grpc.ClientConn, error) {
	p.RLock()
	pool, ok := p.conns[addr]
	p.RUnlock()
	if !ok {
		err := p.newCommonPool(addr)
		if err != nil {
			return nil, err
		}
	}

	p.RLock()
	pool = p.conns[addr]
	p.RUnlock()
	conn, err := pool.Get()
	if err != nil {
		return nil, err
	}

	return conn.(*grpc.ClientConn), nil
}

func (p *GRPCPool) Put(addr string, conn *grpc.ClientConn) error {
	p.RLock()
	defer p.RUnlock()
	pool, ok := p.conns[addr]
	if ok {
		return pool.Put(conn)
	}

	return ErrInvalidConn
}

// 释放连接池
func (p *GRPCPool) Release(addr string) {
	p.Lock()
	defer p.Unlock()
	pool, ok := p.conns[addr]
	if !ok {
		return
	}
	pool.Release()
	delete(p.conns, addr)
}

// 释放所有连接池
func (p *GRPCPool) ReleaseAll() {
	p.Lock()
	defer p.Unlock()
	for _, pool := range p.conns {
		pool.Release()
	}
}

// 初始化底层连接池
func (p *GRPCPool) newCommonPool(addr string) error {
	p.Lock()
	defer p.Unlock()
	commonPool, ok := p.conns[addr]
	if ok {
		return nil
	}
	poolConfig := &pool.Config{
		InitialCap: 1,
		MaxCap:     30,
		Factory: func() (interface{}, error) {
			if !app.Setting.EnableTLS {
				return grpc.Dial(addr, grpc.WithInsecure())
			}

			server := strings.Split(addr, ":")

			certificate := auth.Certificate{
				CAFile:     app.Setting.CAFile,
				CertFile:   app.Setting.CertFile,
				KeyFile:    app.Setting.KeyFile,
				ServerName: server[0],
			}

			transportCreds, err := certificate.GetTransportCredsForClient()
			if err != nil {
				return nil, err
			}

			return grpc.Dial(addr, grpc.WithTransportCredentials(transportCreds))
		},
		Close: func(v interface{}) error {
			conn, ok := v.(*grpc.ClientConn)
			if ok && conn != nil {
				return conn.Close()
			}
			return ErrInvalidConn
		},
		IdleTimeout: 3 * time.Minute,
	}

	commonPool, err := pool.NewChannelPool(poolConfig)
	if err != nil {
		return err
	}

	p.conns[addr] = commonPool

	return nil
}
