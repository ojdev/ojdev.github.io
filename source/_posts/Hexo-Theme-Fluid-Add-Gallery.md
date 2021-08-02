---
title: 给Hexo-Theme-Fluid-主题增加相册功能
date: 2021-08-01 19:17:26
tags:
  - Hexo
  - 主题
  - 相册
---
# 前言

Fluid主题中与图集功能，但是直接用来做相册效果并不大好，不知道是不是我的用法的问题，使用了图集的相册页面fancybox会失效，但是hexo也没有相册插件，很多都是直接的相册主题，当然，主打轻盈的hexo用来做相册，也许违背了它的初衷。随后在Fluid的文档中发现了hexo 5的新功能，[注入器](https://hexo.fluid-dev.com/posts/hexo-injector/)

# 注入器

Hexo 注入器是 Hexo 5 版本加入的一项新功能，注入器可以将静态代码片段注入生成的HTML 的 <head> 和 <body> 中。这部分不做过多的介绍了。

有了这个功能，便可以在不破坏原主题的情况下增加功能，而且以后即使更换主题也不受影响。

## scripts

在根目录下创建一个`scripts`文件夹，该文件夹与`source`和`themes`处于同一层级，然后在`scripts`目录下创建一个`injector.js`文件，其中编辑其内容为:
```javascript
hexo.extend.injector.register('head_end', 
`
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/@fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.css">
<link rel="stylesheet" href="/assets/justifiedGallery.min.css" />
`,
'gallery')
hexo.extend.injector.register('body_end', 
`
  <script src="https://cdn.jsdelivr.net/npm/@fancyapps/fancybox@3.5.7/dist/jquery.fancybox.min.js"></script>
  <script src="/assets/jquery.justifiedGallery.min.js"></script>
  <script src="/assets/gallery.js"></script>
`,
'gallery')
```

这里的`/assets/`路径是我在`source`文件夹下创建的，里面用来放一些css文件和js文件。

最后一个参数`'gallery'`表示的是用在那个布局下，可以任意写，这个布局体现在`index.md`中的`layout:`,例如:

```markdown
---
title: 相册
date: 2021-07-29 15:52:59
layout: gallery
---
```

这段代码的意思是在`</head>`前面插入两个css文件的引用和在`</body>`前面插入三个js文件的引用，其中[justifiedGallery](https://miromannino.github.io/Justified-Gallery/)是自动生成瀑布流的插件，下载下来后都放到`/source/assets`下，接下来编辑`gallery.js`

## gallery.js

理想状态是自动读取目录下的图片，然后生成相册，后来发现那样有些麻烦，我的风格就是用最简单的方式快捷实现需求并且容易维护，所以采用了一些常见的使用json的方式来实现，这个文件中就是找到主题中的`<article class="page-content">`部分，然后使用js插入从json中读出来的照片，输出成a标签和图片表情，并支持fancybox图集的形式，然后调用前面引用的`justifiedGallery`来生成瀑布流。

```javascript
(function () {
    el = $("article.page-content");
    if (el !== undefined) {
        el.innerHTML = '';
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                galleryContent = document.createElement("div");
                galleryContent.class = "justified-gallery";
                function renderGallery(node) {
                    if (node.contents !== undefined && node.contents.length > 0) {
                        node.contents.forEach(sd => {
                            imgUrl = node.name + '/' + sd.name;
                            imgThumbUrl = node.name + '/thumbnails/thumb_' + sd.name;
                            galleryContent.innerHTML += `
                                <a  href="`+ imgUrl + `" data-fancybox="images">
                                    <img src="`+ imgThumbUrl + `">
                                </a>
                            `;
                        });
                    }
                }
                data.forEach(d => renderGallery(d));
                el.append(galleryContent);
                galleryContent.justifiedGallery({ rowHeight: 150, margins: 5 });
            });
    }
})();

```

# 相册的用法


## 创建相册页面

上面的准备工作基本上就做完了，接下来就是使用了，我们先创建一个`hexo new page gallery`,然后手动增加一行`layout: gallery`就是下面这个样子。

```markdown
---
title: 相册
date: 2021-07-29 15:52:59
layout: gallery
---
```

## 添加相册缩略图

然后我们在gallery下创建一个文件夹比如`harbin`然后将我们分类的照片都放进去，因为我使用的是github，而且，照片都是原图，一个页面中直接显示会特别的慢，于是我就自己创建缩略图，这是需要用到`apt install imagemagick`，然后再`harbin`文件夹中创建一个文件`convert_thumb.sh`填入如下内容：

```shell
#!/bin/bash
for i in *.jpg
do
    echo "生成缩略图 $i ..."
    convert -thumbnail 480 $i ./thumbnails/thumb_$i
done
```

每当harbin中新增图片的时候就执行一下它，就自动在`thumbnails`下创建了`thumb_`开头的缩略图了。

## 生成data.json

我想到了`tree`正好新版本的有`tree -J` 可以直接生成`data.json`,在`gallery`文件夹下执行

```shell
tree -J > data.json
```

我们得到了data.json文件，还需要稍微编辑一下，其实也可以直接用的，作为那种分类相册，我这里就直接编辑成单个相册的，所以去掉外层的没用信息，去掉非图片的内容，想下面这样的结构：
```json
[
  {
    "type": "directory",
    "name": "harbin",
    "contents": [
      ...
    ]
  }
]
```

我还去掉了缩略图文件的部分，因为也用不上。

# 结束

至此，发布后就可以使用了，默认展示瀑布流是用的缩略图，单击打开的fancybox使用的是原图，注入器这样还可以有更多的玩法的，并且，由于懒的原因，我也没有更加的细化，以后可能会将这个改造单页面中的分类相册的形式。



