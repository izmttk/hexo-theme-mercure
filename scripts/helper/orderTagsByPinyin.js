const pinyin = require('pinyin');
function fnPinyin(words) {
    return pinyin(words, {
        segment: true,
        style: pinyin.STYLE_NORMAL
    });
}
function pinyin_filter(array, key, toString) {
    if (!array instanceof Array) return [];
    if (typeof toString !== 'function') toString = (item) => item.toString()
    let res = array.filter((item) => {
        return key === pinyin(toString(item), {
            segment: true,
            style: pinyin.STYLE_NORMAL
        })[0][0][0].toUpperCase();
    })
    return res;
}
/*
按照拼音顺序排序并归类标签，返回格式
[
    {
        key: 'A', //key表示拼音首字母
        tags: [tags...]
    },
    ...
]
*/
function orderTagsByPinyin(tags) {
    let res = [], normal_tags = [], other_tags = [];
    //normal_tags: 以字母或汉字开头的标签
    //other_tags: 以数字或特殊符号开头的标签
    for (let i = 0; i < 26; i++) {
        let i_key = String.fromCharCode(i + 66);
        let i_tags = pinyin_filter(tags, i_key, tag => tag.name);
        res.push({
            key: i_key,
            tags: i_tags.sort((a, b) => b.length - a.length)
        });
        //记录已经归类的普通标签，方便最后归类特殊标签
        normal_tags = normal_tags.concat(i_tags);
    }
    tags.forEach((tag) => {
        if (!normal_tags.includes(tag))
            other_tags.push(tag);
    });
    res.push({
        key: '#',
        tags: other_tags.sort((a, b) => b.length - a.length)
    });
    return res;
}
// hexo.extend.helper.register('pinyin', fnPinyin);
// hexo.extend.helper.register('pinyin_filter', pinyin_filter);
hexo.extend.helper.register('orderTagsByPinyin', orderTagsByPinyin);
