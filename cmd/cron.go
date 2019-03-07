package cmd

import (
	"github.com/linthan/gocron/cmd/cron"
)

func init() {
	rootCmd.AddCommand(cron.Cmd)
}
