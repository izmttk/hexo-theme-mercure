/* 
 * cover.path 特色图片的路径
 * cover.type 特色图片展示类型
 *  - 'none' 无特色图片
 *  - 'left' 左侧显示
 *  - 'right' 右侧显示
 *  - 'fill' 填充卡片背景
 */
function getCover(post) {
    let cover_path = '', cover_type = 'none';
    // 如果cover属性直接填链接
    // cover:String
    if ((typeof post.cover) == 'string') {
        cover_path = post.cover;
        cover_type = 'left';
    }
    // 如果cover填了链接和类型
    // cover:{
    //   path: String,  图片路径
    //   type: String   图片位置
    // }
    if ((typeof post.cover) == 'object') {
        if (post.cover.path) cover_path = post.cover.path;
        if (post.cover.type) cover_type = post.cover.type;
    }
    return {
        path: cover_path,
        type: cover_type
    }
}

hexo.extend.helper.register('getCover', getCover);