package example

import (
	"fmt"

	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

//Cmd 定时任务
var Cmd = &cobra.Command{
	Use:   "example",
	Short: "example",
	Long:  `example`,
	Run: func(cmd *cobra.Command, args []string) {
		fmt.Println(viper.GetString("server.http.port"))
	},
}
