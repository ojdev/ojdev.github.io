---
title: GO语言基本法
date: 2025-08-03 22:23:00
updated: 2025-08-03 22:23:00
categories:
- [软件开发]
tags:
- GO语言
---

# 1. **基本语法**

```go
package main

import "fmt"

func main() {
    fmt.Println("Hello world!")
}
```

- **package main** 是包名，每个应用程序都要有一个main的包
- **import "fmt"** 引入包
- **func main() {** 用的入口，`{`不能单独一行
- 如果变量名/方法名/Type/Struct等以大写开头，则等同于public，可以其他包在导入后进行调用
- 
# 1.1 **定义变量和常量**

```go
var a int
b := 2
var a, b, c int = 1, 2, 3 
var a, b, c = 1, 2, false
a, b, c := 1, 2, false
var (
    a int
    b int
    c bool
)
```

第二种类似于C#中的var，根据值进行推断。

```go
const Hello string = "hello world"

const (
	A = "d"
	B = 2
	C = "p"
	D = A + C
	E = B * B，
    F
)

func main() {
	fmt.Println(A, B, C, D, E, F)
}

```

这是常量,定义方式与变量类似

# 2. **执行与打包**

- `go run ***.go` 直接运行
- `go build ***.go`  编译为二进制文件,windows环境会编译成exe

# 3. **其他**

## 3.1 **引入多个包**
```go
package main

import (
    "fmt"
    "net/http"
)

func main() {
    fmt.Println("Hello world!")
}
```

# 4. **http服务**

```go
package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/go", myHandler)
	http.ListenAndServe(":8088", nil)
}

func myHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println(r.RemoteAddr, "连接成功")
	// 请求方式：GET POST DELETE PUT UPDATE
	fmt.Println("method:", r.Method)
	// /go
	fmt.Println("url:", r.URL.Path)
	fmt.Println("header:", r.Header)
	fmt.Println("body:", r.Body)
	// 回复
	w.Write([]byte("helloworld"))
}

```

- `http.HandleFunc("/go", myHandler)` 一个路由(controller的action)，myHandler方法
- `http.ListenAndServe(":8088", nil)` 监听端口，8088
- `w.Write([]byte("helloworld"))` 返回的内容

运行后，访问`http://127.0.0.1:8088/go`会返回helloworld

**支持匿名方法**

```go
package main

import (
	"fmt"
	"net/http"
)

func main() {
	http.HandleFunc("/go", func(w http.ResponseWriter, r *http.Request) {
		fmt.Println(r.RemoteAddr, "连接成功")
		// 请求方式：GET POST DELETE PUT UPDATE
		fmt.Println("method:", r.Method)
		// /go
		fmt.Println("url:", r.URL.Path)
		fmt.Println("header:", r.Header)
		fmt.Println("body:", r.Body)
		// 回复
		w.Write([]byte("helloworld"))
	})
	http.ListenAndServe(":8088", nil)
}

```

# 5. **调用**

项目文件夹为`d:\github\gotest`

```shell
go mod init gotest
```

会在根目录下生成一个go.mod文件,在创建一个httpserv文件夹然后文件树目录如下：

```
d:\github\gotest
│-go.mod
│-mainapp.go
└─httpserv
        serv.go
        s1.go
```

- mainapp.go

```go
package main

import (
	"net/http"

	serv "gotest/httpserv" //引入httpserv文件夹
)

func main() {
	http.HandleFunc("/go", serv.HelloHandler) //嗲用
	http.ListenAndServe(":8088", nil)
}

```

- serv.go

```go
package serv

import (
	"fmt"
	"net/http"
)

func HelloHandler(w http.ResponseWriter, r *http.Request) {
	fmt.Println(r.RemoteAddr, "连接成功")
    Demo() //可以直接调用同名包下的其他文件中的方法
	// 请求方式：GET POST DELETE PUT UPDATE
	fmt.Println("method:", r.Method)
	// /go
	fmt.Println("url:", r.URL.Path)
	fmt.Println("header:", r.Header)
	fmt.Println("body:", r.Body)
	// 回复
	w.Write([]byte("helloworld"))
}
```

- s1.go

```go
package serv

import (
	"fmt"
)

func Demo() {
	fmt.Println("demo")
}

```