hexo.extend.generator.register('tags_index', function(locals){
  return {
    path: 'tags/index.html',
    layout: 'tag',
    data: {
      title: '全部标签',
      layout: 'tag',
      tag: true,
      index: true,
    }
  };
});
