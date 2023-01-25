const defaultConfig = {
  favicon: '/favicon.ico',
  author: {
    name: '未知作者',
    avatar: null,
    background: null,
    signature: '这个人很懒，什么都没有留下',
    social: []
  },
  header: {
    enable: true,
    bottom_effect: 'none',
  },
  navigator: {
    enable: true,
    logo: '',
    menu: [
      {name: '分类', url: '/categories'},
      {name: '标签', url: '/tags'},
      {name: '归档', url: '/archives'},
    ],
    toolkit: {
      search:  true,
      colormode: true
    }
  },
  sidebar:{
    enable: true,
    profile: {
      enable: true,
    },
    stats: {
      enable: true,
    },
    tag_cloud: {
      enable: true,
    },
    category_tree: {
      enable: true,
    },
    toc: {
      enable: true,
    }
  },
  footer: {
    enable: true,
    text: null
  },
  fabs: {
    enable: true,
    goto_top: {
      enable: true,
    },
    goto_comment: {
      enable: true,
    },
  },
  colormode: 'auto',
  post_card: {
    cover: {
      type: 'plain',
      position: 'alter'
    }
  },
  plugins: {
    katex: {
      enable: false,
    },
    anchor: {
      enable: false,
    },
    lazyload: {
      enable: false,
      loading_img: null,
      error_img: null,
    },
    pjax: {
      enable: true,
    },
    overlay_scrollbar: {
      enable: true,
    }
  },
  search: {
    enable: false,
    local_search: {
      enable: false,
      placeholder: '请输入关键词开始搜索',
      searchAsYouType: false
    },
    algolia_search: {
      enable: false,
      configure:{
        enable: true,
        hitsPerPage: 8,
      },
      searchBox: {
        enable: true,
        placeholder: '请输入关键字开始搜索',
        searchAsYouType: false,
      },
      poweredBy: {
        enable: false,
      },
      hits: {
        enable: false,
      },
      infiniteHits: {
        enable: true,
      },
      stats: {
        enable: false,
      },
      pagination: {
        enable: false,
      }
    }
  },
  loading: {
    enable: true,
    splash: {
      type: 'none',
    },
    text: '加载中...',
  },
  comments: {
    enable: false
  },
  layout: {
    home: {
      header: {
        enable: true,
        cover: {
          type: 'normal',
          image: '/assets/default-bg.webp',
        },
        title: '无标题',
        description: {
          type: 'normal',
          content: '无描述',
        },
        bottom_effect: 'none',
        scroll_indicator: true,
      }
    },
    friends: {
      sidebar: {
        enable: false,
      },
    },
    404: {
      header: {
        enable: false,
      },
      sidebar: {
        enable: false,
      },
      footer: {
        enable: false,
      },
      comments: {
        enable: false
      },
    }
  },
  build: {
    manual: false,
    env: null
  }
};

module.exports = defaultConfig;