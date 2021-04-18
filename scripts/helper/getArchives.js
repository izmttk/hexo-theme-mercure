const moment = require('moment');
//年度归档数组中是否已经创建year年
function has_year(array, year) {
    if (!array instanceof Array) return false;
    return array.some((item) => item.year == year);
}
//月度归档数组中是否已经创建month月份
function has_month(array, month) {
    if (!array instanceof Array) return false;
    return array.some((item) => item.month == month);
}
/*
按照时间归档文章，返回格式
[
    {
        year: xxxx
        archives: [
            {
                month: xx
                archives: [posts...]
            },
            {
                month: xx
                archives: [posts...]
            }
            ...
        ]
    }
    ...
]
*/
function getArchives() {
    let res = [];
    let sorted_posts = this.site.posts.sort('date', -1);
    sorted_posts.each((post) => {
        let year = post.date.year(),
            month = post.date.month() + 1;
        //如果当前文章年份归档没有创建，创建年份归档并归类当前文章
        if (!has_year(res, year)) {
            res.push({
                year: year,
                archives: [{
                    month: month,
                    archives: [post]
                }]
            });
        }
        else {
            let year_index = res.findIndex((item) => item.year == year);
            //当前文章的年份归档已经存在，检查月归档是否存在
            //不存在就创建，存在就直接写入
            if (!has_month(res[year_index].archives, month)) {
                res[year_index].archives.push({
                    month: month,
                    archives: [post]
                })
            }
            else {
                let month_index = res[year_index].archives.findIndex((item) => item.month == month);
                res[year_index].archives[month_index].archives.push(post);
            }
        }
    });
    return res;
}
hexo.extend.helper.register('getArchives', getArchives);
