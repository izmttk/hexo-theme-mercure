const fs = require('hexo-fs');
const path = require('path');

function hyphenate(str) {
    let hyphenateRE = /\B([A-Z])/g;
    return str.replace(hyphenateRE, '-$1').toLowerCase()
}

function loadTemplate(srcPath) {
    const templatePath = path.join(srcPath, 'template.html');
    if(fs.existsSync(templatePath)) {
        let template = fs.readFileSync(templatePath);
        return template;
    }
    return null;
}

function loadStyle(srcPath) {
    const stylePath = path.join(srcPath, 'style.css');
    if(fs.existsSync(stylePath)) {
        let style = fs.readFileSync(stylePath);
        return style;
    }
    return null;
}

function loadScript(srcPath) {
    const scriptPath = path.join(srcPath, 'index.js');
    if(fs.existsSync(scriptPath)) {
        let script = fs.readFileSync(scriptPath);
        return script;
    }
    return null;
}

function renderComponentString(srcPath) {
    if(!fs.statSync(srcPath).isDirectory()) {
        throw new Error('Parameter must be a directory');
    }
    const camelCaseName = path.basename(srcPath);
    const spinalCaseName = hyphenate(camelCaseName);

    let script = loadScript(srcPath);
    if(script !== null) {
        script = `<script type="text/javascript">${script}customElements.define('${spinalCaseName}', ${camelCaseName});
        </script>`;
    } else {
        return '';
    }

    let style = loadStyle(srcPath);
    if(style !== null) {
        style = `<style>${style}</style>`;
    } else {
        style = '';
    }

    let template = loadTemplate(srcPath);
    if(template !== null) {
        return `<template id="template-${spinalCaseName}">${style}${template}</template>${script}`;
    } else {
        return script;
    }
}

function renderAllComponentString(srcPath) {
    const list = fs.readdirSync(srcPath);
    let result = '';
    list.forEach(item => {
        const curPath = path.join(srcPath, item);
        if(fs.statSync(curPath).isDirectory()) {
            result += renderComponentString(curPath);
        }
    });
    // console.log(result)
    return result;
}

hexo.extend.injector.register('body_begin', () => {
    const basePath = path.join(hexo.theme_dir, 'components'); 
    const prefixScript = `
    <script type="text/javascript">
    HTMLElement.prototype.upgradeProperty = function (prop) {
        if (this.hasOwnProperty(prop)) {
            let value = this[prop];
            delete this[prop];
            this[prop] = value;
        }
    };
    HTMLElement.prototype.hasLightDOM = function () {
        return this.children.length || this.textContent.trim().length;
    };
    </script>`;
    return `${prefixScript}<div id="components">${renderAllComponentString(basePath)}</div>`;
}, 'default');