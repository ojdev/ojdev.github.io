(function () {
    el = document.querySelector("article.page-content");
    if (el !== undefined) {
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                function renderGallery(node) {
                    el.innerHTML += node.type + '&nbsp;&nbsp;' + node.name + '<br />';
                    if (node.contents !== undefined && node.contents.length > 0) {
                        node.contents.forEach(sd => {
                            el.innerHTML += '<img style="padding: 0; border: none; width: 128px; height:128px;" src="' + node.name + '/thumbnails/thumb_' + sd.name + '">'
                        });
                        //renderGallery(el, node);
                    }
                }
                data.forEach(d => renderGallery(d));
            });
    }
})();
