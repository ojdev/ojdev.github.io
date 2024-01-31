---
title: 使用Python的pyecharts包画关系图
date: 2022-07-13 21:16:00
categories:
- [软件开发, python, 小技巧]
tags:
- Python
- pyecharts
- 关系图
- 架构
---

我们使用csv格式的文件存储关系，第一个为主节点，第二列为子节点，就像如下的形式

| 主节点 | 子节点 |
|----|----|
| 节点1 | 节点A |
| 节点1 | 节点B |
| 节点1 | 节点C |
| 节点B | 节点N |
| 节点C | 节点N |

下面是python代码，先安装pyecharts`pip(3) install pyecharts`

```python
import csv
from turtle import color
from pyecharts import options as opts
from pyecharts.charts import Graph

csv_reader = csv.reader(open("./relation.csv"))
systems = []
relation=[]
for left in csv_reader:
    l = left[0]; r = left[1];
    relation.append({"main":l,"sub":r})
    systems.append(l)  
    systems.append(r) 

# 节点
nodes = []
for i in list(set(systems)):
    nodes.append({"name": i, "symbolSize": 15})#systems.count(i) 10就是点的大小

# 关系
links = []
for i in nodes:
    for j in relation:
        if(i.get("name") == j.get("main")):
            links.append({"source": i.get("name"), "target": j.get("sub")})

#输出网页
c = (
    Graph(init_opts=opts.InitOpts(         
        width="1800px",  # 网页分辨率
        height="1000px",  # 网页分辨率
        bg_color="#F2F2F2", # 背景色 注释掉就没颜色
        ))
    .add(
        # https://pyecharts.org/#/zh-cn/basic_charts?id=graph%ef%bc%9a%e5%85%b3%e7%b3%bb%e5%9b%be
        "", 
        nodes, 
        links, 
        repulsion = 100, #引力值 数越大，点之间弹的越大
       # edge_length = 30, # 调整点之间的距离，受上面的repulsion影响
        symbol="roundRect", # 点的形状 triangle 三角形 ，circle 圆形， rect 方形，roundRect 圆角方形， diamond 菱形，pin 图钉 ，arrow 箭头,none 只有线
       # layout="circular", # 布局 是环形， force 是引力型
       # linestyle_opts=opts.LineStyleOpts(curve=0.2), #直线或者弧线
       # label_opts=opts.LabelOpts(is_show=False), # 直接显示标签或者鼠标放上去显示标签，
       # linestyle_opts=opts.LineStyleOpts(color="#feb64d"), # 线颜色
       itemstyle_opts=opts.ItemStyleOpts(color="#151EBF"), # 图标颜色 注释掉就是红色
       # 挑配色的网站  https://color.adobe.com/zh/explore/newest/

    )
    .set_global_opts(
        title_opts=opts.TitleOpts(title="自己改名"), # 标题
        ) 
    .render("graph_base.html")
)
```
