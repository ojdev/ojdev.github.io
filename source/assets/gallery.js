(function () {
    el = document.querySelector("article.page-content");
    if (el !== undefined) {
        el.innerHTML = '';
        fetch('data.json')
            .then(response => response.json())
            .then(data => {
                el.innerHTML = '<div id="gallery-content" class="justified-gallery">'
                function renderGallery(node) {
                    if (node.contents !== undefined && node.contents.length > 0) {
                        node.contents.forEach(sd => {
                            imgUrl = node.name + '/' + sd.name;
                            imgThumbUrl = node.name + '/thumbnails/thumb_' + sd.name;
                            el.innerHTML += `
                                <a  href="`+ imgUrl + `">
                                    <img src="`+ imgThumbUrl + `">
                                </a>
                            `;
                        });
                    }
                }
                data.forEach(d => renderGallery(d));
                el.innerHTML += '</div>';
                $('#gallery-content').justifiedGallery({ rowHeight: 70, lastRow: 'nojustify', margins: 3 });
            });
    }
})();
