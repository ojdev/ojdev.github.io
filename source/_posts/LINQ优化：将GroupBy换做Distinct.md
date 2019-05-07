---
title: LINQ优化：将GroupBy换做Distinct
date: 2011-05-06 18:23:18
tags:
---

这样做也是没有办法的，我之前项目中，查询中这样写的分组

~~~csharp
form t in db.Table
where t.state==true
group t by new
{
   t.A,
   t.B,
   t.C
}
into p
select new{
   ...
}
~~~

导致的就是，数据表中不到1W行数据，经过分组后是752行，但是第一次查询要将近10秒。

这太不能容忍了，所以思来想去，只有更换为Distinct来解决。

~~~ csharp
(form t in db.Table
where t.state==true
select new{
   ...
}).Distinct();
~~~

感觉很好，不到1秒，只是微软对Distinct的支持不是很好，因为这个去重靠的是每个对象的比对，对象相同则去重，而无法对某一个字段去重，很遗憾。