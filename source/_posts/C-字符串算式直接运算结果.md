---
title: 'C#字符串算式直接运算结果'
date: 2011-08-19 18:24:49
categories:
- [软件开发, .Net, 基础知识]
tags:
    - C#
---

有些似乎后会遇到一种情况，就是要求，一个字符串形式的四则运算，直接求出结果，以前在C#中使用js反射实现，现在发现了一种新的方法，更方便：

界面上的元素
~~~csharp
Label :name=result;//显示表达式结果

TextBox :name=expressiontext;//表达式
~~~
代码只有一句：

~~~csharp
result.Text = new DataTable().Compute(expressiontext.Text, string.Empty).ToString();
~~~

测试了一下，正常的+-/*都可以的，支持带括号运算方式，不支持%运算，其他未测试。
