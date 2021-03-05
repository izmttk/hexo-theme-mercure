function categories_json (depth=0, parent) {
    let res=[];
    let cur_cats = this.site.categories.find({parent:parent}).sort({length: -1,name:1}).filter(cat=>cat.length);
    if(cur_cats.length!=0) {
        cur_cats.each(cat => {
            let hasChildren = this.site.categories.find({parent:cat._id}).length!=0;
            let obj = {
                id: cat._id,
                label: cat.name,
                url: this.url_for(cat.path),
                count: cat.length
            }
            if(hasChildren) 
            Object.assign(obj, {
                children: categories_json.call(this, depth+1, cat._id)
            })
            res.push(obj);
        })
    }
    if(depth === 0) {
        // console.log(res);
        return JSON.stringify(res);
    }
    else return res;
}
hexo.extend.helper.register('categories_json', categories_json);
