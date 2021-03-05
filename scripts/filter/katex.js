const katex = require('katex');
const jsdom = require("jsdom");
const { JSDOM } = jsdom;
let document;
const findEndOfMath = function(delimiter, text, startIndex) {
    // Adapted from
    // https://github.com/Khan/perseus/blob/master/src/perseus-markdown.jsx
    let index = startIndex;
    let braceLevel = 0;

    const delimLength = delimiter.length;

    while (index < text.length) {
        const character = text[index];

        if (braceLevel <= 0 &&
            text.slice(index, index + delimLength) === delimiter) {
            return index;
        } else if (character === "\\") {
            index++;
        } else if (character === "{") {
            braceLevel++;
        } else if (character === "}") {
            braceLevel--;
        }

        index++;
    }

    return -1;
};

const splitAtDelimiters = function(startData, leftDelim, rightDelim, display) {
    const finalData = [];

    for (let i = 0; i < startData.length; i++) {
        if (startData[i].type === "text") {
            const text = startData[i].data;

            let lookingForLeft = true;
            let currIndex = 0;
            let nextIndex;

            nextIndex = text.indexOf(leftDelim);
            if (nextIndex !== -1) {
                currIndex = nextIndex;
                finalData.push({
                    type: "text",
                    data: text.slice(0, currIndex),
                });
                lookingForLeft = false;
            }

            while (true) {
                if (lookingForLeft) {
                    nextIndex = text.indexOf(leftDelim, currIndex);
                    if (nextIndex === -1) {
                        break;
                    }

                    finalData.push({
                        type: "text",
                        data: text.slice(currIndex, nextIndex),
                    });

                    currIndex = nextIndex;
                } else {
                    nextIndex = findEndOfMath(
                        rightDelim,
                        text,
                        currIndex + leftDelim.length);
                    if (nextIndex === -1) {
                        break;
                    }

                    finalData.push({
                        type: "math",
                        data: text.slice(
                            currIndex + leftDelim.length,
                            nextIndex),
                        rawData: text.slice(
                            currIndex,
                            nextIndex + rightDelim.length),
                        display: display,
                    });

                    currIndex = nextIndex + rightDelim.length;
                }

                lookingForLeft = !lookingForLeft;
            }

            finalData.push({
                type: "text",
                data: text.slice(currIndex),
            });
        } else {
            finalData.push(startData[i]);
        }
    }

    return finalData;
};
const splitWithDelimiters = function(text, delimiters) {
    let data = [{type: "text", data: text}];
    for (let i = 0; i < delimiters.length; i++) {
        const delimiter = delimiters[i];
        data = splitAtDelimiters(
            data, delimiter.left, delimiter.right,
            delimiter.display || false);
    }
    return data;
};

/* Note: optionsCopy is mutated by this method. If it is ever exposed in the
 * API, we should copy it before mutating.
 */
const renderMathInText = function(text, optionsCopy) {
    const data = splitWithDelimiters(text, optionsCopy.delimiters);
    if (data.length === 1 && data[0].type === 'text') {
        // There is no formula in the text.
        // Let's return null which means there is no need to replace
        // the current text node with a new one.
        return null;
    }

    const fragment = document.createDocumentFragment();

    for (let i = 0; i < data.length; i++) {
        if (data[i].type === "text") {
            fragment.appendChild(document.createTextNode(data[i].data));
        } else {
            const span = document.createElement("span");
            let math = data[i].data;
            // Override any display mode defined in the settings with that
            // defined by the text itself
            optionsCopy.displayMode = data[i].display;
            try {
                if (optionsCopy.preProcess) {
                    math = optionsCopy.preProcess(math);
                }
                span.innerHTML = katex.renderToString(math, optionsCopy);
            } catch (e) {
                if (!(e instanceof katex.ParseError)) {
                    throw e;
                }
                optionsCopy.errorCallback(
                    "KaTeX auto-render: Failed to parse `" + data[i].data +
                    "` with ",
                    e
                );
                fragment.appendChild(document.createTextNode(data[i].rawData));
                continue;
            }
            fragment.appendChild(span);
        }
    }

    return fragment;
};

const renderElem = function(elem, optionsCopy) {
    for (let i = 0; i < elem.childNodes.length; i++) {
        const childNode = elem.childNodes[i];
        if (childNode.nodeType === 3) {
            // Text 节点
            const frag = renderMathInText(childNode.textContent, optionsCopy);
            if (frag) {
                i += frag.childNodes.length - 1;
                elem.replaceChild(frag, childNode);
            }
        } else if (childNode.nodeType === 1) {
            // Element 节点
            const className = ' ' + childNode.className + ' ';
            const shouldRender = optionsCopy.ignoredTags.indexOf(
                childNode.nodeName.toLowerCase()) === -1 &&
                    optionsCopy.ignoredClasses.every(
                        x => className.indexOf(' ' + x + ' ') === -1);

            if (shouldRender) {
                renderElem(childNode, optionsCopy);
            }
        }
        // Otherwise, it's something else, and ignore it.
    }
};

const renderMathInElement = function(elem, options) {
    if (!elem) {
        throw new Error("No element provided to render");
    }

    const optionsCopy = {};

    // Object.assign(optionsCopy, option)
    for (const option in options) {
        if (options.hasOwnProperty(option)) {
            optionsCopy[option] = options[option];
        }
    }

    // 默认设置
    optionsCopy.delimiters = optionsCopy.delimiters || [
        {left: "$$", right: "$$", display: true},
        {left: "\\(", right: "\\)", display: false},
        // LaTeX 使用 $…$, 但是这样影响了正常 `$` 在文本中的显示:
        // {left: "$", right: "$", display: false},

        //  \[…\] 必须在列表最后. 否则, renderMathInElement 会在匹配 $$ 或  \( 前先匹配 \[ 
        // 这会使得程序容易找到 \\[0.3em] 行分隔符并将它视为Katex数学区的开始
        {left: "\\[", right: "\\]", display: true},
    ];
    optionsCopy.ignoredTags = optionsCopy.ignoredTags || [
        "script", "noscript", "style", "textarea", "pre", "code", "option",
    ];
    optionsCopy.ignoredClasses = optionsCopy.ignoredClasses || [];
    optionsCopy.errorCallback = optionsCopy.errorCallback || console.error;

    // 在一次调用 `renderMathInElement` 时，可以在不同的 Math Element 之间共享通过`\gdef` 定义的全局宏。
    optionsCopy.macros = optionsCopy.macros || {};

    renderElem(elem, optionsCopy);
};
hexo.extend.filter.register('after_post_render', function(data) {
    if(this.theme.config.plugins.katex) {
        document = new JSDOM(data.content).window.document;
        // console.log(document.body.childNodes.length)
        renderMathInElement(document.body, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false},
                {left: '\\(', right: '\\)', display: false},
                {left: '\\[', right: '\\]', display: true}
            ]
        });
        data.content = document.body.innerHTML;
        return data;
    }
})
