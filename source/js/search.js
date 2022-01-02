let LocalSearch = (function () {
    let ajax_path = "";
    function LocalSearch(search_id, content_id) {
        this.inputElement = document.querySelector('#' + search_id);
        this.resultElement = document.querySelector('#' + content_id);
        this.cache = null;
        this.lastKeywords = '';
    }
    LocalSearch.setPath = function (path) {
        ajax_path = path;
    };
    LocalSearch.prototype.getKeywords = function () {
        return this.inputElement.value;
    }
    LocalSearch.prototype.searchContent = function (post, queryText) {
        let post_title = post.title.trim().toLowerCase();
        let post_content = post.content.trim().toLowerCase();
        let keywords = queryText.trim().toLowerCase().split(' ');
        let foundMatch = false;
        let index_title = -1;
        let index_content = -1;
        let first_occur = -1;
        if (post_title !== '' || post_content !== '') {
            for (let index = 0; index < keywords.length; index++) {
                const word = keywords[index];
                index_title = post_title.indexOf(word);
                index_content = post_content.indexOf(word);
                if (index_title < 0 && index_content < 0) {
                    foundMatch = false;
                } else {
                    foundMatch = true;
                    if (index_content < 0) {
                        index_content = 0;
                    }
                    if (index === 0) {
                        first_occur = index_content;
                    }
                }
                if (foundMatch) {
                    post_content = post.content.trim();
                    let start = 0;
                    let end = 0;
                    if (first_occur >= 0) {
                        start = Math.max(first_occur - 40, 0);
                        end = start === 0 ? Math.min(200, post_content.length) : Math.min(first_occur + 120, post_content.length);
                        let match_content = post_content.substring(start, end);
                        keywords.forEach(function (keyword) {
                            let regS = new RegExp(keyword, 'gi');
                            match_content = match_content.replace(regS, '<mark>' + keyword + '</mark>');
                            // post.title = post_title.replace(regS, '<b mark>' + keyword + '</b>');
                        });
                        post.digest = match_content + '......';
                    } else {
                        end = Math.min(200, post_content.length);
                        post.digest = post_content.trim().substring(0, end);
                    }
                }
            }
        }
        return foundMatch;
    };
    LocalSearch.prototype.updateResult = function (data, queryText) {
        if (queryText.trim().length == 0) return;
        let that = this;
        let resultList = document.createElement('ul');
        resultList.classList.add('search-result-list');
        data.forEach(post => {
            if (that.searchContent(post, queryText)) {
                let listItem = document.createElement('li');
                listItem.classList.add('search-result-list-item');
                let link = document.createElement('a');
                link.classList.add('search-result-link');
                link.href = post.url;
                let title = document.createElement('span');
                title.classList.add('search-result-title');
                title.innerHTML = post.title;
                let digest = document.createElement('span');
                digest.classList.add('search-result-digest');
                digest.innerHTML = post.digest;
                link.appendChild(title);
                link.appendChild(digest);
                listItem.appendChild(link);
                resultList.appendChild(listItem);
            }
        })
        let searchResult = document.createElement('div');
        searchResult.id = 'search-result';
        if ([...resultList.children].filter(item => {
            return item.classList.contains('search-result-list-item')
        }).length > 0) {
            searchResult.appendChild(resultList);
        } else {
            let resultInfo = document.createElement('span');
            resultInfo.classList.add('no-result');
            resultInfo.innerText = '没有找到相关内容~';
            searchResult.appendChild(resultInfo);
        }
        this.resultElement.innerHTML = null;
        this.resultElement.appendChild(searchResult);
    }
    LocalSearch.prototype.isKeywordsChanged = function () {
        return this.lastKeywords.trim() != this.getKeywords().trim();
    }
    LocalSearch.prototype.isEmpty= function () {
        return this.getKeywords().trim().length === 0;
    }
    LocalSearch.prototype.query = function () {
        if (!ajax_path) throw new Error('No ajax path specified');
        let that = this;
        let keywords = this.getKeywords();
        this.lastKeywords = keywords;
        if (this.cache === null) {
            fetch(ajax_path)
            .then(response => response.json())
            .then(data => {
                let res = data.map(item => {
                    return {
                        title: item.title ?? '',
                        content: item.content ?? '',
                        url: item.url ?? '',
                    }
                });
                that.cache = res;
                that.updateResult(res, keywords);
            });
        } else {
            that.updateResult(this.cache, keywords);
        }
    }
    return LocalSearch;
})();