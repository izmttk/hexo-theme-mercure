hexo.extend.generator.register('categories_index', function(locals){
  return {
    path: 'categories/index.html',
    layout: 'category',
    data: {
      title: '全部分类',
      layout: 'category',
      category: true,
      index: true,
    }
  };
});
