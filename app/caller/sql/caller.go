package sql

import (
	"fmt"
	"sync"
	"time"

	"github.com/jinzhu/gorm"
	"github.com/linthan/gocron/app/caller"
	"github.com/spf13/viper"
)

type sqlStruct struct {
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

func (i *callerInner) newSQL(sqlConf *sqlStruct) (db *gorm.DB, err error) {
	db, err = gorm.Open("mysql", sqlConf.Dsn)
	if err != nil {
		return
	}
	db.LogMode(sqlConf.Debug)
	db.DB().SetMaxOpenConns(sqlConf.MaxOpenConns)
	db.DB().SetMaxIdleConns(sqlConf.MaxIdleConns)

	if sqlConf.ConnMaxLifetime != 0 {
		db.DB().SetConnMaxLifetime(sqlConf.ConnMaxLifetime)
	}

	err = db.DB().Ping()
	return
}

func (i *callerInner) loadConfig() map[string]*sqlStruct {

	config := make(map[string]*sqlStruct)
	prefix := "echo.sql"
	for key := range viper.GetStringMap(prefix) {
		tmp := new(sqlStruct)
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
		db, err = i.newSQL(config)
		if err != nil {
			panic(err)
		}
		i.instances.Store(key, db)
		fmt.Printf("sql(%s) caller init...\n", key)
	}
	return err
}
