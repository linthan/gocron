//go:generate statik -src=./web/react/dist -dest=./app -f
package main

import (
	_ "github.com/jinzhu/gorm/dialects/mysql"
	_ "github.com/jinzhu/gorm/dialects/postgres"

	"github.com/linthan/gocron/cmd"
)

func main() {
	cmd.Execute()
}

