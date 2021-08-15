/* 
 * cover.path 特色图片的路径
 * cover.type 特色图片展示类型
 *  - 'none' 无特色图片
 *  - 'blur' 卡片背景为图片模糊
 *  - 'full' 卡片背景为图片填充
 *  - 'material' 卡片背景从图片取色
 */
function getPageCover(post) {
    
    let coverConfig = hexo.theme.config?.post_card?.cover;
    // console.log(hexo.theme.config)

    let coverPath = null, coverType = coverConfig.type, coverPos = coverConfig.position;
    // 如果cover属性直接填链接
    // cover:String
    if ((typeof post.cover) == 'string') {
        coverPath = post.cover;
    }
    // 如果cover填了链接和类型
    // cover:{
    //   path: String,  图片路径
    //   type: String   图片位置
    // }

    if ((typeof post.cover) == 'object') {
        if (post.cover.path) coverPath = post.cover.path;
        if(['none', 'blur', 'material', 'full'].includes(post.cover.type)) {
            coverType = post.cover.type;
        }
    }
    if(coverPath == null) coverType = 'none';
    return {
        path: coverPath,
        type: coverType,
        position: coverPos,
        background: coverConfig.background,
    }
}

hexo.extend.helper.register('getPageCover', getPageCover);