---
title: 'C#方法延迟返回结果'
date: 2012-04-13 15:52:12
tags:
    - C#
---

不知道标题恰不恰当，只不过我的需求是这个样子的：

例如一个方法A，返回值是bool类型的，但是方法执行过程中，需要另一个方法B执行结束，但是还不能直接调用B方法，可是B是等待外部信号才执行。所以需要延迟一下，等B方法执行了才返回结果。

找了些资料，找到了AutoResetEvent，可以达到我的目的，但是否是最适合的，就不知道了，由于我的项目中所谓的B方法是RS232端口读数据的，然后解析出来的返回值。并不是时时的，可能有点时间差，于是我采用了下面的方式。

~~~ csharp
/// <summary>
/// 标志位，用来等待返回
/// </summary>
AutoResetEvent are = new AutoResetEvent(false);
/// <summary>
/// 返回结果，可以是任意需要的类型
/// </summary>
object result;

public object A()
{
    /****Begin**/
    /*
        * 数据的拼装
        * 数据的发送
        **/
    Send("要传输的数据");
    /****End****/

    //等待信号，-1代表无限等待，可以更改为其他值，单位是毫秒，等待时间过后为超时
    are.WaitOne(-1, false);
    return result;
}
private void B()
{
    byte[] bytes = Read();
    /*
        * 此处解析bytes中的数据
        * 根据解析出来的数据
        * 得到想要的结果
        * */

    //得到需要的结果
    result = Encoding.UTF8.GetString(bytes);
    //给信号
    are.Set();
}
~~~