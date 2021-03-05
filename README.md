# hexo-theme-anonymous

写着玩的hexo主题，没想好起啥名

## 安装方式

hexo根目录下：

```bash
npm install hexo-generator-search hexo-renderer-ejs
```

主题目录下：

```bash
npm install
```

如果你想要二次开发，请安装开发环境依赖：

```bash
npm install -D
```

## ToDo

- [x] 基础排版
- [ ] 头部
- [x] 文章
- [x] 边栏
- [x] 导航条
- [ ] 搜索功能
- [ ] 音乐播放器
- [ ] 社会化评论
- [ ] 缓存
- [ ] pjax
- [ ] 站长统计
- [ ] 性能优化

## 开发

项目使用postcss预处理器，在开发时可以开启渲染插件（在script/render中），生产环境请预生产css文件并改为直接饮用此css文件。否则将会有性能上的损失。

关于katex需要在服务端渲染好还是全交给浏览器的问题，还未考虑好。
