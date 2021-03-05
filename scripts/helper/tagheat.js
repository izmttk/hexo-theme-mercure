function getTagHeat(tag) {
    if(tag.length/this.site.posts.length>0.2) return 2;
    if(tag.length/this.site.posts.length>0.1) return 1;
    return 0;
};
hexo.extend.helper.register('getTagHeat', getTagHeat);
