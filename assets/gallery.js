void 0!==(el=$("article.page-content"))&&(el.innerHTML="",fetch("data.json").then(e=>e.json()).then(e=>{(galleryContent=document.createElement("div")).id="gallery-content",galleryContent.class="justified-gallery",e.forEach(e=>{var n;void 0!==(n=e).contents&&0<n.contents.length&&n.contents.forEach(e=>{imgUrl=n.name+"/"+e.name,imgThumbUrl=n.name+"/thumbnails/thumb_"+e.name,galleryContent.innerHTML+=`
                                <a  href="`+imgUrl+`" data-fancybox="images">
                                    <img src="`+imgThumbUrl+`">
                                </a>
                            `})}),el.append(galleryContent),$("#gallery-content").justifiedGallery({rowHeight:150,margins:5})}));