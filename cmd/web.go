package cmd

import (
	"github.com/linthan/gocron/cmd/web"
)

func init() {
	rootCmd.AddCommand(web.WebCmd)
}
