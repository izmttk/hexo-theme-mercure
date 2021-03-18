var LocalSearch = (function () {
    var ajax_path = "";
    function LocalSearch(search_id, content_id) {
        this.inputElement = $('#'+search_id);
        this.resultElement = $('#'+content_id);
        this.cache = undefined;
    }
    LocalSearch.setPath = function(path) {
        ajax_path = path;
    };
    LocalSearch.prototype.getInputText = function () {
        return this.inputElement.val();
    }
    LocalSearch.prototype.searchContent = function(post, queryText) {
        var post_title = post.title.trim().toLowerCase();
        var post_content = post.content.trim().toLowerCase();
        var keywords = queryText.trim().toLowerCase().split(' ');
        var foundMatch = false;
        var index_title = -1;
        var index_content = -1;
        var first_occur = -1;
        if(post_title !== '' || post_content !== '') {
            $.each(keywords, function(index, word) {
                index_title = post_title.indexOf(word);
                index_content = post_content.indexOf(word);
                if(index_title < 0 && index_content < 0) {
                    foundMatch = false;
                } else {
                    foundMatch = true;
                    if(index_content < 0) {
                        index_content = 0;
                    }
                    if(index === 0) {
                        first_occur = index_content;
                    }
                }
                if(foundMatch) {
                    post_content = post.content.trim();
                    var start = 0;
                    var end = 0;
                    if(first_occur >= 0) {
                        start = Math.max(first_occur - 40, 0);
                        end = start === 0 ? Math.min(200, post_content.length) : Math.min(first_occur + 120, post_content.length);
                        var match_content = post_content.substring(start, end);
                        keywords.forEach(function(keyword) {
                            var regS = new RegExp(keyword, 'gi');
                            match_content = match_content.replace(regS, '<mark>' + keyword + '</mark>');
                            // post.title = post_title.replace(regS, '<b mark>' + keyword + '</b>');
                        });
                        post.digest = match_content + '......';
                    } else {
                        end = Math.min(200, post_content.length);
                        post.digest = post_content.trim().substring(0, end);
                    }
                }
            });
        }
        return foundMatch;
    };
    LocalSearch.prototype.updateResult = function (data, queryText) {
        if( queryText.trim().length == 0 ) return;
        var that = this;
        var $resultList = $('<ul class="search-result-list"></ul>');
        $.each(data, function(index, post) {
            if(that.searchContent(post, queryText)) {
                var $listItem = $('<li class="search-result-list-item"></li>');
                var $link = $('<a href="'+post.url+'" class="search-result-link"></a>');
                $link.append('<span class="search-result-title">'+post.title+'</span>');
                $link.append('<span class="search-result-digest">'+post.digest+'</span>');
                $listItem.append($link);
                $resultList.append($listItem);
            }
        });
        var $searchResult = $('<div id="search-result"></div>');
        if( $resultList.children('li').length>0 ) {
            $searchResult.append($resultList);
        } else {
            $searchResult.append('<span class="no-result">找不到结果哦~</span>');
        }
        this.resultElement.empty().append($searchResult);
    }
    LocalSearch.prototype.query = function (keywords) {
        if(!ajax_path) throw new Error('No ajax path specified');
        var that = this;
        if(!keywords) keywords = this.getInputText();
        if(this.cache === undefined){
            $.ajax({
                url: ajax_path,
                dataType: "xml",
                success: function( xmlResponse ) {
                    var datas = $( "entry", xmlResponse ).map(function() {
                        return {
                            title: $( "title", this ).text(),
                            content: $('<span></span>').html($("content",this).text()).text(),
                            url: $( "url" , this).text()
                        };
                    }).get();
                    that.cache = datas;
                    that.updateResult(datas,keywords);
                }
            });
        } else {
            that.updateResult(this.cache,keywords);
        }
    }
    return LocalSearch;
})();