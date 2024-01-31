---
title: 'C#与盗梦空间-我们要进入下一层梦境'
date: 2011-07-10 17:56:55
categories:
- [软件开发, .Net, 基础知识]
tags:
    - C#
    - 盗梦
---

刚才突然想起去年10月份在CSDN上看到的一个帖子。

题目是：完成如下代码，使其输出“Hello World!”

``` java
if(补全这里) printf("Hello");
else printf(" World!");
```

不过是C++的。

问到是用C#如何实现：

``` csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace HelloWorld
{
    class Program
    {
        static void Main(string[] args)
        {
            if (/* 补充这里 */)
                Console.Write("Hello");
            else
                Console.Write(" World!");
        }
    }
}
```

下面的回答千奇百怪。

确实C++我已经六七年没动过了，所以都没概念了。不过一直做C#的开发，确实可以用很多种方法。

但是！下面的回帖中出现了两个让我眼前一亮的内容，一个是27楼的：

``` csharp
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace HelloWorld
{
    class Program
    {
        static void Main(string[] args)
        {
            if (true)Console.Write("Hello World!");else if (false)
                Console.Write("Hello");
            else
                Console.Write(" World!");
        }
    }
}
```

另一个就是42楼的：

```csharp
static void Main(string[] args)
{
    if ((args == null||Main(null) is object))
        Console.Write("Hello");
    else
        Console.Write(" World!");
}
```

27楼的就是代码注入，42楼的很有意思。

遂记录一下，有时候开发的过程总换个思路，就有不同的天空啊。
