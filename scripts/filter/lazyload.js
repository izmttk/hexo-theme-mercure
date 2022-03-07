const url_for = require('hexo-util').url_for.bind(hexo);
const cheerio = require('cheerio');
hexo.extend.filter.register('after_render:html', function (str, data) {
    if (!hexo.theme.config?.plugins?.lazyload?.enable) {
        return str;
    }
    let loadingImg = hexo.theme.config?.plugins?.lazyload?.loading_img;
    // console.log(str);
    str = str.replace(/<img(.*?)src="(.*?)"(.*?)>/gi, function (str, p1, p2) {
        let $ = cheerio.load(str);
        let img = $('img');
        // might be duplicate
        if (img.attr('data-src') || img.attr('data-srcset') || img.hasClass('nolazyload') ||img.attr('loading') == 'eager') {
            return str;
        }
        if (/data:image(.*?)/gi.test(img.attr('src'))) {
            return str;
        }
        img.addClass('lazyload');
        if(img.attr('src')) {
            img.attr('data-src', img.attr('src'));
            img.removeAttr('src');
        }
        if(img.attr('srcset')) {
            img.attr('data-srcset', img.attr('srcset'));
            img.removeAttr('srcset');
        }
        if(img.attr('sizes')) {
            img.attr('data-sizes', $('img').attr('sizes'));
            img.removeAttr('sizes');
        } else {
            img.attr('data-sizes', 'auto');
        }
        if (loadingImg) {
            img.attr('src', url_for(loadingImg));
        } else {
            img.attr('src', "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABGdBTUEAALGPC/xhBQAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAADa6r/EAAAAC0lEQVQIHWNgAAIAAAUAAY27m/MAAAAASUVORK5CYII=");
        }
        return $('body').html();
    });
    return str;
}, 200);