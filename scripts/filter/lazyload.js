const url_for = require('hexo-util').url_for.bind(hexo);
const cheerio = require('cheerio');
hexo.extend.filter.register('after_render:html', function (str, data) {
    let loadingImg = hexo.theme.config?.plugins?.lazyload?.loading_img;
    // console.log(str);
    str = str.replace(/<img(.*?)src="(.*?)"(.*?)>/gi, function (str, p1, p2) {
        let $ = cheerio.load(str);
        let imgEl = $('img');
        // might be duplicate
        if (imgEl.attr('data-src') || imgEl.attr('data-srcset') || imgEl.attr('no-lazy')) {
            return str;
        }
        if (/data:image(.*?)/gi.test(imgEl.attr('src'))) {
            return str;
        }
        imgEl.addClass('lazyload');
        imgEl.attr('data-src', p2);
        imgEl.attr('data-error-src', hexo.theme.config?.plugins?.lazyload?.error_img);
        if (loadingImg) {
            imgEl.attr('src', url_for(loadingImg));
            return $.html();
        }
        imgEl.attr('src', "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAABGdBTUEAALGPC/xhBQAAADhlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAAqACAAQAAAABAAAAAaADAAQAAAABAAAAAQAAAADa6r/EAAAAC0lEQVQIHWNgAAIAAAUAAY27m/MAAAAASUVORK5CYII=");
        return $.html();

    });
    return str;
})