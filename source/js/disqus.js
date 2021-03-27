const disqus_shortname = '<%= theme.comments.disqus.shortname %>';
const autoload = '<%= theme.comments.disqus.autoload %>';
const global_url = '<%= config.url %>';

function checkDisqus() {
    // 正在检查 Disqus 能否访问...
    const runcheck = (domain) => {
        return new Promise((resolve, reject) => {
            const img = new Image;
            const timeout = setTimeout(() => {
                img.onerror = img.onload = null;
                reject();
            }, 3000);
            img.onerror = () => {
                clearTimeout(timeout);
                reject();
            }
            img.onload = () => {
                clearTimeout(timeout);
                resolve();
            }
            img.src = `https://${domain}/favicon.ico?${+(new Date)}=${+(new Date)}`;
        })
    }
    return Promise.all([
        runcheck('<%= theme.comments.disqus.shortname %>.disqus.com')
    ]).then(loadDisqus, showError);
}

function loadDisqus() {
    let path = pdata.commentPath;
    if (path.length == 0) {
        let defaultPath = '<%= theme.comments.disqus.path %>';
        path = defaultPath || decodeURI(window.location.pathname);
    }
    if (window.DISQUS) {
        window.DISQUS.reset({
            reload: true,
            config() {
                this.page.identifier = global_url + path;
                this.page.url = global_url + path;
            }
        });
    } else {
        window.disqus_config = function () {
            this.page.url = global_url + path;
            this.page.identifier = global_url + path;
        };
        let d = document, s = d.createElement('script');
        s.async = true;
        s.src = '//' + disqus_shortname + '.disqus.com/embed.js';
        s.setAttribute('data-timestamp', +new Date());
        (d.head || d.body).appendChild(s);
    }
}

// 加载错误
function showError() {
    $('#loading-comments').hide();
    $('#notShowDisqus').show();
}

// 点击了加载
function needLoadDisqus() {
    checkDisqus();
    $('#load-btns').hide();
    $('#loading-comments').show();
}

if (autoload == 'true') {
    needLoadDisqus();
}