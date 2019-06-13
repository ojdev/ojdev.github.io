---
title: asp.net后台执行js造成样式失效
date: 2011-01-12 17:49:00
tags:
    - asp.net
---

在asp.net中后台执行js时，比如使用Response.Write弹出一个alert

~~~csharp
Response.Write("<script>alert('确定。')</script>");
~~~

这样做有时候会造成页面的css样式表错位或者失效

为了避免这样的情况，使用下面的方法

~~~ csharp
this.ClientScript.RegisterStartupScript(this.GetType(), "alter", "alert('确定。');", true);
~~~