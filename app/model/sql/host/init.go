package host

//Mysql 初始化
type Mysql struct {
	master string
}

//Init 初始化
func Init(master string) *Mysql {
	return &Mysql{
		master: master,
	}
}
