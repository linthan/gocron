package host

//QueryReq 查询语句
type QueryReq struct {
	ID       int    `query:"id"`
	Name     string `query:"name"`
	Page     int    `query:"page"`
	PageSize int    `query:"page_size"`
}
