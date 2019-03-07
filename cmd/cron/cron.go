package cron

import (
	"github.com/linthan/gocron/cmd/cron/example"
	"github.com/spf13/cobra"
)



//Cmd  represents the web command
var Cmd = &cobra.Command{
	Use:   "cron",
	Short: "cron",
	Long:  `cron`,
}

//init 初始化
func init() {
	Cmd.AddCommand(example.Cmd)
}
