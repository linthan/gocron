package util

import (
	"bytes"
	"sort"
)

//GetURLParams 计算queryString
func GetURLParams(params map[string]interface{}) string {
	// Sort
	keys := make([]string, 0, len(params))
	for k := range params {
		keys = append(keys, k)
	}
	sort.Strings(keys)

	// Serialize
	var buf bytes.Buffer
	for _, k := range keys {
		if buf.Len() > 0 {
			buf.WriteByte('&')
		}
		buf.WriteString(k)
		if params[k] != nil {
			buf.WriteString("=" + params[k].(string))
		}
	}
	return buf.String()
}
