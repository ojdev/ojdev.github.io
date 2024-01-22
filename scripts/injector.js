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
hexo.extend.filter.register('theme_inject', function(injects) {
	injects.bodyEnd.raw('adsense', '<script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1462206097231302" crossorigin="anonymous"></script>');
	injects.head.raw('adsense', '<style>ins.adsbygoogle[data-ad-status="unfilled"] { display: none !important; }</style>');
	injects.postLeft.raw('adsense', '<aside class="sidebar d-none d-xl-block" style="margin-right:-1rem;z-index:-1"><ins class="adsbygoogle" style="display:flex;justify-content:center;min-width:160px;max-width:300px;width:100%;height:600px;position:sticky;top:2rem" data-ad-client="ca-pub-1462206097231302" data-ad-slot="4806082429"></ins><script> (adsbygoogle = window.adsbygoogle || []).push({}); </script></aside>');
	injects.postCopyright.raw('adsense', '<div style="width:100%;display:flex;justify-content:center;margin-bottom:1.5rem"><ins class="adsbygoogle" style="display:flex;justify-content:center;max-width:845px;width:100%;height:90px" data-ad-client="ca-pub-1462206097231302" data-ad-slot="4806082429"></ins><script> (adsbygoogle = window.adsbygoogle || []).push({}); </script></div>');
});
