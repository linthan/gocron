package mysql

import (
	"fmt"
	"sync"
	"time"

	"github.com/jinzhu/gorm"
	"github.com/linthan/gocron/app/caller"
	"github.com/spf13/viper"
)

type mysqlStruct struct {
	Dsn             string
	Debug           bool
	Level           string
	MaxOpenConns    int
	MaxIdleConns    int
	ConnMaxLifetime time.Duration
}

type callerInner struct {
	caller.Base
	instances sync.Map
}

func (i *callerInner) newMysql(mysqlConf *mysqlStruct) (db *gorm.DB, err error) {

	db, err = gorm.Open("mysql", mysqlConf.Dsn)
	if err != nil {
		return
	}

	db.LogMode(mysqlConf.Debug)
	db.DB().SetMaxOpenConns(mysqlConf.MaxOpenConns)
	db.DB().SetMaxIdleConns(mysqlConf.MaxIdleConns)

	if mysqlConf.ConnMaxLifetime != 0 {
		db.DB().SetConnMaxLifetime(mysqlConf.ConnMaxLifetime)
	}

	err = db.DB().Ping()
	return
}

func (i *callerInner) loadConfig() map[string]*mysqlStruct {

	config := make(map[string]*mysqlStruct)
	prefix := "echo.mysql"
	for key := range viper.GetStringMap(prefix) {
		tmp := new(mysqlStruct)
		err := viper.UnmarshalKey(prefix+"."+key, tmp)
		if err != nil {
			continue
		}
		config[key] = tmp
	}

	return config
}

func (i *callerInner) Init(opts ...caller.Option) error {
	var err error

	i.instances = sync.Map{}
	for key, config := range i.loadConfig() {
		var db *gorm.DB
		db, err = i.newMysql(config)
		if err != nil {
			panic(err)
		}
		i.instances.Store(key, db)
		fmt.Printf("mysql(%s) caller init...\n", key)
	}

	return err
}
