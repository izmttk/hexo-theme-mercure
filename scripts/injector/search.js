const css = hexo.extend.helper.get('css').bind(hexo);
const js = hexo.extend.helper.get('js').bind(hexo);
const url_for = hexo.extend.helper.get('url_for').bind(hexo);

hexo.extend.injector.register('head_end', () => {
    if (!hexo.config.search) return '';
    let search_path = hexo.config.search.path;
    if (search_path.length == 0) {
        search_path = 'search.xml';
    }
    let path = url_for(search_path);
    return js('/js/search.js')
    +`<script type="text/javascript">LocalSearch.setPath('${path}')</script>`;
});