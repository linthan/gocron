package cmd

import (
	"fmt"
	"os"

	"github.com/linthan/gocron/config"
	"github.com/spf13/cobra"
	"github.com/spf13/viper"
)

// rootCmd represents the base command when called without any subcommands
var rootCmd = &cobra.Command{
	Use:   "gocron",
	Short: "gocron",
	Long:  `gocron`,
}

// Execute adds all child commands to the root command and sets flags appropriately.
// This is called by main.main(). It only needs to happen once to the rootCmd.
func Execute() {

	if err := rootCmd.Execute(); err != nil {
		fmt.Println(err)
		os.Exit(1)
	}
}

//init 初始化
func init() {
	rootCmd.PersistentFlags().StringVar(&config.CfgFile, "config", "config/config-dev.toml", "config file (default is config/config-live.toml)")
	cobra.OnInitialize(initConfig)
}

func initConfig() {
	if config.CfgFile != "" {
		// Use config file from the flag.
		viper.SetConfigFile(config.CfgFile)
		if err := viper.ReadInConfig(); err != nil {
			fmt.Println("Can't read config:", err)
			os.Exit(1)
		}
	}
}
