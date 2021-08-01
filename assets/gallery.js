(function () {
    el = document.querySelector("article.page-content");
    if (el !== undefined) {
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                data.forEach(d => {
                    el.innerHTML += d.type + '&nbsp;&nbsp;' + d.name + '<br />';
                    if (d.contents !== undefined && d.contents.length > 0) {
                        d.contents.forEach(sd => {
                            el.innerHTML += sd.type + '&nbsp;&nbsp;' + sd.name + '<br />';
                            '<img style="padding: 0; border: none; width: 128px; height:128px;" src="' +  sd.name + '">'
                        });
                    }
                });
            });
    }
    //   posts[0].innerHTML = '<div class="note note-warning" style="font-size:0.9rem"><p>' +
    //     '<div class="h6">文章时效性提示</div><p>这是一篇发布于 ' + days + ' 天前的文章，部分信息可能已发生改变，请注意甄别。' +
    //     '</p></p></div>' + posts[0].innerHTML;
})();
