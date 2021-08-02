hexo.extend.injector.register('head_end', 
`
<link rel="stylesheet" href="/assets/justifiedGallery.min.css" />
`,
'gallery')
hexo.extend.injector.register('body_end', 
`
  <script src="/assets/jquery.justifiedGallery.min.js"></script>
  <script src="/assets/gallery.js"></script>
`,
'gallery')