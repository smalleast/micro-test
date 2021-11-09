const version = '0.1.0';
// do not use isUndefined
const isBrowser = typeof window !== 'undefined';
const globalThis = !isUndefined(global)
    ? global
    : !isUndefined(window)
        ? window
        : !isUndefined(self)
            ? self
            : Function('return this')();
// is Undefined
function isUndefined(target) {
    return target === undefined;
}
// is Null
function isNull(target) {
    return target === null;
}
// is String
function isString(target) {
    return typeof target === 'string';
}
// is Boolean
function isBoolean(target) {
    return typeof target === 'boolean';
}
// is function
function isFunction(target) {
    return typeof target === 'function';
}
// is Array
const isArray = Array.isArray;
// is PlainObject
function isPlainObject(target) {
    return toString.call(target) === '[object Object]';
}
// is Promise
function isPromise(target) {
    return toString.call(target) === '[object Promise]';
}
/**
 * format error log
 * @param msg message
 * @param appName app name, default is null
 */
function logError(msg, appName = null, ...rest) {
    const appNameTip = appName && isString(appName) ? ` app ${appName}:` : '';
    if (isString(msg)) {
        console.error(`[micro-app]${appNameTip} ${msg}`, ...rest);
    }
    else {
        console.error(`[micro-app]${appNameTip}`, msg, ...rest);
    }
}
/**
 * format warn log
 * @param msg message
 * @param appName app name, default is null
 */
function logWarn(msg, appName = null, ...rest) {
    const appNameTip = appName && isString(appName) ? ` app ${appName}:` : '';
    if (isString(msg)) {
        console.warn(`[micro-app]${appNameTip} ${msg}`, ...rest);
    }
    else {
        console.warn(`[micro-app]${appNameTip}`, msg, ...rest);
    }
}
/**
 * async execution
 * @param fn callback
 * @param args params
 */
function defer(fn, ...args) {
    Promise.resolve().then(fn.bind(null, ...args));
}
/**
 * Add address protocol
 * @param url address
 */
function addProtocol(url) {
    return url.startsWith('//') ? `${location.protocol}${url}` : url;
}
/**
 * Format URL address
 * @param url address
 */
function formatURL(url, appName = null) {
    if (!isString(url) || !url)
        return '';
    try {
        const { origin, pathname, search } = new URL(addProtocol(url));
        // If it ends with .html/.node/.php/.net/.etc, don’t need to add /
        if (/\.(\w+)$/.test(pathname)) {
            return `${origin}${pathname}${search}`;
        }
        const fullPath = `${origin}${pathname}/`.replace(/\/\/$/, '/');
        return /^https?:\/\//.test(fullPath) ? `${fullPath}${search}` : '';
    }
    catch (e) {
        logError(e, appName);
        return '';
    }
}
/**
 * Get valid address, such as https://xxx/xx/xx.html to https://xxx/xx/
 * @param url app.url
 */
function getEffectivePath(url) {
    const { origin, pathname } = new URL(url);
    if (/\.(\w+)$/.test(pathname)) {
        const fullPath = `${origin}${pathname}`;
        const pathArr = fullPath.split('/');
        pathArr.pop();
        return pathArr.join('/') + '/';
    }
    return `${origin}${pathname}/`.replace(/\/\/$/, '/');
}
/**
 * Complete address
 * @param path address
 * @param baseURI base url(app.url)
 */
function CompletionPath(path, baseURI) {
    if (!path ||
        /^((((ht|f)tps?)|file):)?\/\//.test(path) ||
        /^(data|blob):/.test(path))
        return path;
    return new URL(path, getEffectivePath(addProtocol(baseURI))).toString();
}
/**
 * Get the folder where the link resource is located,
 * which is used to complete the relative address in the css
 * @param linkpath full link address
 */
function getLinkFileDir(linkpath) {
    const pathArr = linkpath.split('/');
    pathArr.pop();
    return addProtocol(pathArr.join('/') + '/');
}
/**
 * promise stream
 * @param promiseList promise list
 * @param successCb success callback
 * @param errorCb failed callback
 * @param finallyCb finally callback
 */
function promiseStream(promiseList, successCb, errorCb, finallyCb) {
    let finishedNum = 0;
    function isFinished() {
        if (++finishedNum === promiseList.length && finallyCb)
            finallyCb();
    }
    promiseList.forEach((p, i) => {
        if (isPromise(p)) {
            p.then((res) => {
                successCb({
                    data: res,
                    index: i,
                });
                isFinished();
            }).catch((err) => {
                errorCb({
                    error: err,
                    index: i,
                });
                isFinished();
            });
        }
        else {
            successCb({
                data: p,
                index: i,
            });
            isFinished();
        }
    });
}
// Check whether the browser supports module script
function isSupportModuleScript() {
    const s = document.createElement('script');
    return 'noModule' in s;
}
// Create a random symbol string
function createNonceSrc() {
    return 'inline-' + Math.random().toString(36).substr(2, 15);
}
// Array deduplication
function unique(array) {
    return array.filter(function (item) {
        return item in this ? false : (this[item] = true);
    }, Object.create(null));
}
// requestIdleCallback polyfill
const requestIdleCallback = globalThis.requestIdleCallback ||
    function (fn) {
        const lastTime = Date.now();
        return setTimeout(function () {
            fn({
                didTimeout: false,
                timeRemaining() {
                    return Math.max(0, 50 - (Date.now() - lastTime));
                },
            });
        }, 1);
    };
/**
 * Record the currently running app.name
 */
let currentMicroAppName = null;
function setCurrentAppName(appName) {
    currentMicroAppName = appName;
}
// get the currently running app.name
function getCurrentAppName() {
    return currentMicroAppName;
}
// Clear appName
function removeDomScope() {
    setCurrentAppName(null);
}
// is safari browser
function isSafari() {
    return /Safari/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent);
}
/**
 * Create pure elements
 */
function pureCreateElement(tagName, options) {
    const element = document.createElement(tagName, options);
    if (element.__MICRO_APP_NAME__)
        delete element.__MICRO_APP_NAME__;
    return element;
}
/**
 * clone origin elements to target
 * @param origin Cloned element
 * @param target Accept cloned elements
 * @param deep deep clone or transfer dom
 */
function cloneNode(origin, target, deep) {
    target.innerHTML = '';
    if (deep) {
        const clonedNode = origin.cloneNode(true);
        const fragment = document.createDocumentFragment();
        Array.from(clonedNode.childNodes).forEach((node) => {
            fragment.appendChild(node);
        });
        target.appendChild(fragment);
    }
    else {
        Array.from(origin.childNodes).forEach((node) => {
            target.appendChild(node);
        });
    }
}

var ObservedAttrName;
(function (ObservedAttrName) {
    ObservedAttrName["NAME"] = "name";
    ObservedAttrName["URL"] = "url";
})(ObservedAttrName || (ObservedAttrName = {}));
// app status
var appStatus;
(function (appStatus) {
    appStatus["NOT_LOADED"] = "NOT_LOADED";
    appStatus["LOADING_SOURCE_CODE"] = "LOADING_SOURCE_CODE";
    appStatus["LOAD_SOURCE_FINISHED"] = "LOAD_SOURCE_FINISHED";
    appStatus["LOAD_SOURCE_ERROR"] = "LOAD_SOURCE_ERROR";
    appStatus["MOUNTING"] = "MOUNTING";
    appStatus["MOUNTED"] = "MOUNTED";
    appStatus["UNMOUNT"] = "UNMOUNT";
})(appStatus || (appStatus = {}));
// lifecycles
var lifeCycles;
(function (lifeCycles) {
    lifeCycles["CREATED"] = "created";
    lifeCycles["BEFOREMOUNT"] = "beforemount";
    lifeCycles["MOUNTED"] = "mounted";
    lifeCycles["UNMOUNT"] = "unmount";
    lifeCycles["ERROR"] = "error";
})(lifeCycles || (lifeCycles = {}));

const globalEnv = {};
function initGloalEnv() {
    if (isBrowser) {
        /**
         * save patch raw methods
         * pay attention to this binding
         */
        const rawSetAttribute = Element.prototype.setAttribute;
        const rawAppendChild = Node.prototype.appendChild;
        const rawInsertBefore = Node.prototype.insertBefore;
        const rawReplaceChild = Node.prototype.replaceChild;
        const rawRemoveChild = Node.prototype.removeChild;
        const rawAppend = Element.prototype.append;
        const rawPrepend = Element.prototype.prepend;
        const rawCreateElement = Document.prototype.createElement;
        const rawCreateElementNS = Document.prototype.createElementNS;
        const rawCreateDocumentFragment = Document.prototype.createDocumentFragment;
        const rawQuerySelector = Document.prototype.querySelector;
        const rawQuerySelectorAll = Document.prototype.querySelectorAll;
        const rawGetElementById = Document.prototype.getElementById;
        const rawGetElementsByClassName = Document.prototype.getElementsByClassName;
        const rawGetElementsByTagName = Document.prototype.getElementsByTagName;
        const rawGetElementsByName = Document.prototype.getElementsByName;
        const rawWindow = Function('return window')();
        const rawDocument = Function('return document')();
        const supportModuleScript = isSupportModuleScript();
        const templateStyle = rawDocument.body.querySelector('#micro-app-template-style');
        /**
         * save effect raw methods
         * pay attention to this binding, especially setInterval, setTimeout, clearInterval, clearTimeout
         */
        const rawWindowAddEventListener = rawWindow.addEventListener;
        const rawWindowRemoveEventListener = rawWindow.removeEventListener;
        const rawSetInterval = rawWindow.setInterval;
        const rawSetTimeout = rawWindow.setTimeout;
        const rawClearInterval = rawWindow.clearInterval;
        const rawClearTimeout = rawWindow.clearTimeout;
        const rawDocumentAddEventListener = rawDocument.addEventListener;
        const rawDocumentRemoveEventListener = rawDocument.removeEventListener;
        // mark current application as base application
        window.__MICRO_APP_BASE_APPLICATION__ = true;
        Object.assign(globalEnv, {
            // source/patch
            rawSetAttribute,
            rawAppendChild,
            rawInsertBefore,
            rawReplaceChild,
            rawRemoveChild,
            rawAppend,
            rawPrepend,
            rawCreateElement,
            rawCreateElementNS,
            rawCreateDocumentFragment,
            rawQuerySelector,
            rawQuerySelectorAll,
            rawGetElementById,
            rawGetElementsByClassName,
            rawGetElementsByTagName,
            rawGetElementsByName,
            // common global vars
            rawWindow,
            rawDocument,
            supportModuleScript,
            templateStyle,
            // sandbox/effect
            rawWindowAddEventListener,
            rawWindowRemoveEventListener,
            rawSetInterval,
            rawSetTimeout,
            rawClearInterval,
            rawClearTimeout,
            rawDocumentAddEventListener,
            rawDocumentRemoveEventListener,
        });
    }
}

// https://developer.mozilla.org/zh-CN/docs/Web/API/CSSRule
var CSSRuleType;
(function (CSSRuleType) {
    CSSRuleType[CSSRuleType["STYLE_RULE"] = 1] = "STYLE_RULE";
    CSSRuleType[CSSRuleType["MEDIA_RULE"] = 4] = "MEDIA_RULE";
    CSSRuleType[CSSRuleType["SUPPORTS_RULE"] = 12] = "SUPPORTS_RULE";
})(CSSRuleType || (CSSRuleType = {}));
/**
 * Bind css scope
 * Special case:
 * 1. html-abc | abc-html
 * 2. html body.abc
 * 3. abchtml | htmlabc | abcbody | bodyabc
 * 4. html + body | html > body | html.body | html[name=xx] | body[name=xx]
 * 5. xxx, html xxx, body xxx
 *
 * TODO: BUG
  .test-b {
    border: 1px solid var(--color-a);
    border-bottom-color: var(--color-b);
  }
 */
function scopedStyleRule(rule, prefix) {
    const { selectorText, cssText } = rule;
    if (/^((html[\s>~,]+body)|(html|body|:root))$/.test(selectorText)) {
        return cssText.replace(/^((html[\s>~,]+body)|(html|body|:root))/, prefix);
    }
    else if (selectorText === '*') {
        return cssText.replace('*', `${prefix} *`);
    }
    const builtInRootSelectorRE = /(^|\s+)((html[\s>~]+body)|(html|body|:root))(?=[\s>~]+|$)/;
    return cssText.replace(/^[\s\S]+{/, (selectors) => {
        return selectors.replace(/(^|,)([^,]+)/g, (all, $1, $2) => {
            if (builtInRootSelectorRE.test($2)) {
                // body[name=xx]|body.xx|body#xx etc. do not need to handle
                return all.replace(builtInRootSelectorRE, prefix);
            }
            return `${$1} ${prefix} ${$2.replace(/^\s*/, '')}`;
        });
    });
}
/**
 * Complete static resource address
 * @param cssText css content
 * @param baseURI domain name
 * @param textContent origin content
 * @param linkpath link resource address, if it is the style converted from link, it will have linkpath
 */
function scopedHost(cssText, baseURI, textContent, linkpath) {
    return cssText.replace(/url\(["']?([^)"']+)["']?\)/gm, (all, $1) => {
        if (/^(data|blob):/.test($1)) {
            return all;
        }
        else if (/^(https?:)?\/\//.test($1)) {
            if (isSafari()) {
                const purePath = $1.replace(/^https?:/, '');
                if (textContent.indexOf(purePath) === -1) {
                    $1 = $1.replace(window.location.origin, '');
                }
                else {
                    return all;
                }
            }
            else {
                return all;
            }
        }
        // ./a/b.png  ../a/b.png  a/b.png
        if (/^((\.\.?\/)|[^/])/.test($1) && linkpath) {
            baseURI = getLinkFileDir(linkpath);
        }
        return `url("${CompletionPath($1, baseURI)}")`;
    });
}
// handle media and supports
function scopedPackRule(rule, prefix, packName) {
    const result = scopedRule(Array.from(rule.cssRules), prefix);
    return `@${packName} ${rule.conditionText} {${result}}`;
}
/**
 * Process each cssrule
 * @param rules cssRule
 * @param prefix prefix as micro-app[name=xxx]
 */
function scopedRule(rules, prefix) {
    let result = '';
    for (const rule of rules) {
        switch (rule.type) {
            case CSSRuleType.STYLE_RULE:
                result += scopedStyleRule(rule, prefix);
                break;
            case CSSRuleType.MEDIA_RULE:
                result += scopedPackRule(rule, prefix, 'media');
                break;
            case CSSRuleType.SUPPORTS_RULE:
                result += scopedPackRule(rule, prefix, 'supports');
                break;
            default:
                result += rule.cssText;
                break;
        }
    }
    return result.replace(/^\s+/, '');
}
/**
 * common method of bind CSS
 */
function commonAction(templateStyle, styleElement, originContent, prefix, baseURI, linkpath) {
    var _a, _b;
    const rules = Array.from((_b = (_a = templateStyle.sheet) === null || _a === void 0 ? void 0 : _a.cssRules) !== null && _b !== void 0 ? _b : []);
    let result = scopedHost(scopedRule(rules, prefix), baseURI, originContent, linkpath);
    /**
     * Solve the problem of missing content quotes in some Safari browsers
     * docs: https://developer.mozilla.org/zh-CN/docs/Web/CSS/content
     * If there are still problems, it is recommended to use the attr()
     */
    if (isSafari()) {
        result = result.replace(/([;{]\s*content:\s*)([^\s"][^";}]*)/gm, (all, $1, $2) => {
            if ($2 === 'none' ||
                /^(url\()|(counter\()|(attr\()|(open-quote)|(close-quote)/.test($2)) {
                return all;
            }
            return `${$1}"${$2}"`;
        });
    }
    styleElement.textContent = result;
}
/**
 * scopedCSS
 * @param styleElement target style element
 * @param appName app name
 */
function scopedCSS(styleElement, appName) {
    const app = appInstanceMap.get(appName);
    if (app === null || app === void 0 ? void 0 : app.scopecss) {
        const prefix = `${microApp.tagName}[name=${appName}]`;
        let templateStyle = globalEnv.templateStyle;
        if (!templateStyle) {
            globalEnv.templateStyle = templateStyle = pureCreateElement('style');
            templateStyle.setAttribute('id', 'micro-app-template-style');
            globalEnv.rawDocument.body.appendChild(templateStyle);
            templateStyle.sheet.disabled = true;
        }
        if (styleElement.textContent) {
            templateStyle.textContent = styleElement.textContent;
            commonAction(templateStyle, styleElement, styleElement.textContent, prefix, app.url, styleElement.linkpath);
            templateStyle.textContent = '';
        }
        else {
            const observer = new MutationObserver(function () {
                var _a, _b;
                observer.disconnect();
                // styled-component will not be processed temporarily
                if ((!styleElement.textContent && ((_b = (_a = styleElement.sheet) === null || _a === void 0 ? void 0 : _a.cssRules) === null || _b === void 0 ? void 0 : _b.length)) ||
                    styleElement.hasAttribute('data-styled'))
                    return;
                commonAction(styleElement, styleElement, styleElement.textContent, prefix, app.url, styleElement.linkpath);
            });
            observer.observe(styleElement, { childList: true });
        }
    }
    return styleElement;
}

function eventHandler(event, element) {
    Object.defineProperties(event, {
        currentTarget: {
            get() {
                return element;
            }
        },
        srcElement: {
            get() {
                return element;
            }
        },
        target: {
            get() {
                return element;
            }
        },
    });
}
function dispatchOnLoadEvent(element) {
    const event = new CustomEvent('load');
    eventHandler(event, element);
    if (isFunction(element.onload)) {
        element.onload(event);
    }
    else {
        element.dispatchEvent(event);
    }
}
function dispatchOnErrorEvent(element) {
    const event = new CustomEvent('error');
    eventHandler(event, element);
    if (isFunction(element.onerror)) {
        element.onerror(event);
    }
    else {
        element.dispatchEvent(event);
    }
}

// Global links, reuse across apps
const globalLinks = new Map();
/**
 * Extract link elements
 * @param link link element
 * @param parent parent element of link
 * @param app app
 * @param microAppHead micro-app-head element
 * @param isDynamic dynamic insert
 */
function extractLinkFromHtml(link, parent, app, microAppHead, isDynamic = false) {
    const rel = link.getAttribute('rel');
    let href = link.getAttribute('href');
    let replaceComment = null;
    if (rel === 'stylesheet' && href) {
        href = CompletionPath(href, app.url);
        if (!isDynamic) {
            replaceComment = document.createComment(`link element with href=${href} move to micro-app-head as style element`);
            const placeholderComment = document.createComment(`placeholder for link with href=${href}`);
            // all style elements insert into microAppHead
            microAppHead.appendChild(placeholderComment);
            app.source.links.set(href, {
                code: '',
                placeholder: placeholderComment,
                isGlobal: link.hasAttribute('global'),
            });
        }
        else {
            return {
                url: href,
                info: {
                    code: '',
                    isGlobal: link.hasAttribute('global'),
                }
            };
        }
    }
    else if (rel && ['prefetch', 'preload', 'prerender', 'icon', 'apple-touch-icon'].includes(rel)) {
        // preload prefetch  icon ....
        if (isDynamic) {
            replaceComment = document.createComment(`link element with rel=${rel}${href ? ' & href=' + href : ''} removed by micro-app`);
        }
        else {
            parent.removeChild(link);
        }
    }
    else if (href) {
        // dns-prefetch preconnect modulepreload search ....
        link.setAttribute('href', CompletionPath(href, app.url));
    }
    if (isDynamic) {
        return { replaceComment };
    }
    else if (replaceComment) {
        return parent.replaceChild(replaceComment, link);
    }
}
/**
 * Get link remote resources
 * @param wrapElement htmlDom
 * @param app app
 * @param microAppHead micro-app-head
 */
function fetchLinksFromHtml(wrapElement, app, microAppHead) {
    const linkEntries = Array.from(app.source.links.entries());
    const fetchLinkPromise = [];
    for (const [url] of linkEntries) {
        const globalLinkCode = globalLinks.get(url);
        globalLinkCode ? fetchLinkPromise.push(globalLinkCode) : fetchLinkPromise.push(fetchSource(url, app.name));
    }
    promiseStream(fetchLinkPromise, (res) => {
        fetchLinkSuccess(linkEntries[res.index][0], linkEntries[res.index][1], res.data, microAppHead, app);
    }, (err) => {
        logError(err, app.name);
    }, () => {
        app.onLoad(wrapElement);
    });
}
/**
 * fetch link succeeded, replace placeholder with style tag
 * @param url resource address
 * @param info resource link info
 * @param data code
 * @param microAppHead micro-app-head
 * @param app app
 */
function fetchLinkSuccess(url, info, data, microAppHead, app) {
    if (info.isGlobal && !globalLinks.has(url)) {
        globalLinks.set(url, data);
    }
    const styleLink = pureCreateElement('style');
    styleLink.textContent = data;
    styleLink.linkpath = url;
    microAppHead.replaceChild(scopedCSS(styleLink, app.name), info.placeholder);
    info.placeholder = null;
    info.code = data;
}
/**
 * get css from dynamic link
 * @param url link address
 * @param info info
 * @param app app
 * @param originLink origin link element
 * @param replaceStyle style element which replaced origin link
 */
function foramtDynamicLink(url, info, app, originLink, replaceStyle) {
    if (app.source.links.has(url)) {
        replaceStyle.textContent = app.source.links.get(url).code;
        scopedCSS(replaceStyle, app.name);
        defer(() => dispatchOnLoadEvent(originLink));
        return;
    }
    if (globalLinks.has(url)) {
        const code = globalLinks.get(url);
        info.code = code;
        app.source.links.set(url, info);
        replaceStyle.textContent = code;
        scopedCSS(replaceStyle, app.name);
        defer(() => dispatchOnLoadEvent(originLink));
        return;
    }
    fetchSource(url, app.name).then((data) => {
        info.code = data;
        app.source.links.set(url, info);
        if (info.isGlobal)
            globalLinks.set(url, data);
        replaceStyle.textContent = data;
        scopedCSS(replaceStyle, app.name);
        dispatchOnLoadEvent(originLink);
    }).catch((err) => {
        logError(err, app.name);
        dispatchOnErrorEvent(originLink);
    });
}

// Global scripts, reuse across apps
const globalScripts = new Map();
/**
 * Extract script elements
 * @param script script element
 * @param parent parent element of script
 * @param app app
 * @param isDynamic dynamic insert
 */
function extractScriptElement(script, parent, app, isDynamic = false) {
    let replaceComment = null;
    let src = script.getAttribute('src');
    if (script.hasAttribute('exclude')) {
        replaceComment = document.createComment('script element with exclude attribute removed by micro-app');
    }
    else if ((script.type && !['text/javascript', 'text/ecmascript', 'application/javascript', 'application/ecmascript', 'module'].includes(script.type)) ||
        script.hasAttribute('ignore')) {
        return null;
    }
    else if ((globalEnv.supportModuleScript && script.noModule) ||
        (!globalEnv.supportModuleScript && script.type === 'module')) {
        replaceComment = document.createComment(`${script.noModule ? 'noModule' : 'module'} script ignored by micro-app`);
    }
    else if (src) { // remote script
        src = CompletionPath(src, app.url);
        const info = {
            code: '',
            isExternal: true,
            isDynamic: isDynamic,
            async: script.hasAttribute('async'),
            defer: script.defer || script.type === 'module',
            module: script.type === 'module',
            isGlobal: script.hasAttribute('global'),
        };
        if (!isDynamic) {
            app.source.scripts.set(src, info);
            replaceComment = document.createComment(`script with src='${src}' extract by micro-app`);
        }
        else {
            return { url: src, info };
        }
    }
    else if (script.textContent) { // inline script
        const nonceStr = createNonceSrc();
        const info = {
            code: script.textContent,
            isExternal: false,
            isDynamic: isDynamic,
            async: false,
            defer: script.type === 'module',
            module: script.type === 'module',
        };
        if (!isDynamic) {
            app.source.scripts.set(nonceStr, info);
            replaceComment = document.createComment('inline script extract by micro-app');
        }
        else {
            return { url: nonceStr, info };
        }
    }
    else {
        replaceComment = document.createComment('script element removed by micro-app');
    }
    if (isDynamic) {
        return { replaceComment };
    }
    else {
        return parent.replaceChild(replaceComment, script);
    }
}
/**
 *  Get remote resources of script
 * @param wrapElement htmlDom
 * @param app app
 */
function fetchScriptsFromHtml(wrapElement, app) {
    const scriptEntries = Array.from(app.source.scripts.entries());
    const fetchScriptPromise = [];
    const fetchScriptPromiseInfo = [];
    for (const [url, info] of scriptEntries) {
        if (info.isExternal) {
            const globalScriptText = globalScripts.get(url);
            if (globalScriptText) {
                info.code = globalScriptText;
            }
            else if (!info.defer && !info.async) {
                fetchScriptPromise.push(fetchSource(url, app.name));
                fetchScriptPromiseInfo.push([url, info]);
            }
        }
    }
    if (fetchScriptPromise.length) {
        promiseStream(fetchScriptPromise, (res) => {
            fetchScriptSuccess(fetchScriptPromiseInfo[res.index][0], fetchScriptPromiseInfo[res.index][1], res.data);
        }, (err) => {
            logError(err, app.name);
        }, () => {
            app.onLoad(wrapElement);
        });
    }
    else {
        app.onLoad(wrapElement);
    }
}
/**
 * fetch js succeeded, record the code value
 * @param url script address
 * @param info resource script info
 * @param data code
 */
function fetchScriptSuccess(url, info, data) {
    if (info.isGlobal && !globalScripts.has(url)) {
        globalScripts.set(url, data);
    }
    info.code = data;
}
/**
 * Execute js in the mount lifecycle
 * @param scriptList script list
 * @param app app
 * @param initedHook callback for umd mode
 */
function execScripts(scriptList, app, initedHook) {
    const scriptListEntries = Array.from(scriptList.entries());
    const deferScriptPromise = [];
    const deferScriptInfo = [];
    for (const [url, info] of scriptListEntries) {
        if (!info.isDynamic) {
            if (info.defer || info.async) {
                if (info.isExternal && !info.code) {
                    deferScriptPromise.push(fetchSource(url, app.name));
                }
                else {
                    deferScriptPromise.push(info.code);
                }
                deferScriptInfo.push([url, info]);
                if (info.module)
                    initedHook.moduleCount = initedHook.moduleCount ? ++initedHook.moduleCount : 1;
            }
            else {
                runScript(url, info.code, app, info.module, false);
            }
        }
    }
    if (deferScriptPromise.length) {
        Promise.all(deferScriptPromise).then((res) => {
            res.forEach((code, index) => {
                const [url, info] = deferScriptInfo[index];
                runScript(url, info.code = info.code || code, app, info.module, false, initedHook);
            });
            initedHook(isUndefined(initedHook.moduleCount));
        }).catch((err) => {
            logError(err, app.name);
            initedHook(true);
        });
    }
    else {
        initedHook(true);
    }
}
/**
 * run code
 * @param url script address
 * @param code js code
 * @param app app
 * @param module type='module' of script
 * @param isDynamic dynamically created script
 * @param callback callback of module script
 */
function runScript(url, code, app, module, isDynamic, callback) {
    var _a;
    try {
        code = bindScope(url, code, app, module);
        if (app.inline || module) {
            const scriptElement = pureCreateElement('script');
            setInlinScriptContent(url, code, module, scriptElement, callback);
            if (isDynamic)
                return scriptElement;
            (_a = app.container) === null || _a === void 0 ? void 0 : _a.querySelector('micro-app-body').appendChild(scriptElement);
        }
        else {
            Function(code)();
            if (isDynamic)
                return document.createComment('dynamic script extract by micro-app');
        }
    }
    catch (e) {
        console.error(`[micro-app from runScript] app ${app.name}: `, e);
    }
}
/**
 * Get dynamically created remote script
 * @param url script address
 * @param info info
 * @param app app
 * @param originScript origin script element
 */
function runDynamicRemoteScript(url, info, app, originScript) {
    const dispatchScriptOnLoadEvent = () => dispatchOnLoadEvent(originScript);
    if (app.source.scripts.has(url)) {
        const existInfo = app.source.scripts.get(url);
        if (!info.module)
            defer(dispatchScriptOnLoadEvent);
        return runScript(url, existInfo.code, app, info.module, true, dispatchScriptOnLoadEvent);
    }
    if (globalScripts.has(url)) {
        const code = globalScripts.get(url);
        info.code = code;
        app.source.scripts.set(url, info);
        if (!info.module)
            defer(dispatchScriptOnLoadEvent);
        return runScript(url, code, app, info.module, true, dispatchScriptOnLoadEvent);
    }
    let replaceElement;
    if (app.inline || info.module) {
        replaceElement = pureCreateElement('script');
    }
    else {
        replaceElement = document.createComment(`dynamic script with src='${url}' extract by micro-app`);
    }
    fetchSource(url, app.name).then((code) => {
        info.code = code;
        app.source.scripts.set(url, info);
        if (info.isGlobal)
            globalScripts.set(url, code);
        try {
            code = bindScope(url, code, app, info.module);
            if (app.inline || info.module) {
                setInlinScriptContent(url, code, info.module, replaceElement, dispatchScriptOnLoadEvent);
            }
            else {
                Function(code)();
            }
        }
        catch (e) {
            console.error(`[micro-app from runDynamicScript] app ${app.name}: `, e, url);
        }
        if (!info.module)
            dispatchOnLoadEvent(originScript);
    }).catch((err) => {
        logError(err, app.name);
        dispatchOnErrorEvent(originScript);
    });
    return replaceElement;
}
/**
 * common handle for inline script
 * @param url script address
 * @param code js code
 * @param module type='module' of script
 * @param scriptElement target script element
 * @param callback callback of module script
 */
function setInlinScriptContent(url, code, module, scriptElement, callback) {
    if (module) {
        // module script is async, transform it to a blob for subsequent operations
        const blob = new Blob([code], { type: 'text/javascript;charset=utf-8' });
        scriptElement.src = URL.createObjectURL(blob);
        scriptElement.setAttribute('type', 'module');
        if (!url.startsWith('inline-')) {
            scriptElement.setAttribute('originSrc', url);
        }
        if (callback) {
            callback.moduleCount && callback.moduleCount--;
            scriptElement.onload = callback.bind(scriptElement, callback.moduleCount === 0);
        }
    }
    else {
        scriptElement.textContent = code;
    }
}
/**
 * bind js scope
 * @param url script address
 * @param code code
 * @param app app
 * @param module type='module' of script
 */
function bindScope(url, code, app, module) {
    if (isPlainObject(microApp.plugins)) {
        code = usePlugins(url, code, app.name, microApp.plugins);
    }
    if (app.sandBox && !module) {
        globalEnv.rawWindow.__MICRO_APP_PROXY_WINDOW__ = app.sandBox.proxyWindow;
        return `;(function(window, self){with(window){;${code}\n}}).call(window.__MICRO_APP_PROXY_WINDOW__, window.__MICRO_APP_PROXY_WINDOW__, window.__MICRO_APP_PROXY_WINDOW__);`;
    }
    return code;
}
/**
 * Call the plugin to process the file
 * @param url script address
 * @param code code
 * @param appName app name
 * @param plugins plugin list
 */
function usePlugins(url, code, appName, plugins) {
    var _a;
    if (isArray(plugins.global)) {
        for (const plugin of plugins.global) {
            if (isPlainObject(plugin) && isFunction(plugin.loader)) {
                code = plugin.loader(code, url, plugin.options);
            }
        }
    }
    if (isArray((_a = plugins.modules) === null || _a === void 0 ? void 0 : _a[appName])) {
        for (const plugin of plugins.modules[appName]) {
            if (isPlainObject(plugin) && isFunction(plugin.loader)) {
                code = plugin.loader(code, url, plugin.options);
            }
        }
    }
    return code;
}

// Record element and map element
const dynamicElementInMicroAppMap = new WeakMap();
/**
 * Process the new node and format the style, link and script element
 * @param parent parent node
 * @param child new node
 * @param app app
 */
function handleNewNode(parent, child, app) {
    if (child instanceof HTMLStyleElement) {
        if (child.hasAttribute('exclude')) {
            const replaceComment = document.createComment('style element with exclude attribute ignored by micro-app');
            dynamicElementInMicroAppMap.set(child, replaceComment);
            return replaceComment;
        }
        else if (app.scopecss && !child.hasAttribute('ignore')) {
            return scopedCSS(child, app.name);
        }
        return child;
    }
    else if (child instanceof HTMLLinkElement) {
        if (child.hasAttribute('exclude')) {
            const linkReplaceComment = document.createComment('link element with exclude attribute ignored by micro-app');
            dynamicElementInMicroAppMap.set(child, linkReplaceComment);
            return linkReplaceComment;
        }
        else if (!app.scopecss || child.hasAttribute('ignore')) {
            return child;
        }
        const { url, info, replaceComment } = extractLinkFromHtml(child, parent, app, null, true);
        if (url && info) {
            const replaceStyle = pureCreateElement('style');
            replaceStyle.linkpath = url;
            foramtDynamicLink(url, info, app, child, replaceStyle);
            dynamicElementInMicroAppMap.set(child, replaceStyle);
            return replaceStyle;
        }
        else if (replaceComment) {
            dynamicElementInMicroAppMap.set(child, replaceComment);
            return replaceComment;
        }
        return child;
    }
    else if (child instanceof HTMLScriptElement) {
        const { replaceComment, url, info } = extractScriptElement(child, parent, app, true) || {};
        if (url && info) {
            if (info.code) { // inline script
                const replaceElement = runScript(url, info.code, app, info.module, true);
                dynamicElementInMicroAppMap.set(child, replaceElement);
                return replaceElement;
            }
            else { // remote script
                const replaceElement = runDynamicRemoteScript(url, info, app, child);
                dynamicElementInMicroAppMap.set(child, replaceElement);
                return replaceElement;
            }
        }
        else if (replaceComment) {
            dynamicElementInMicroAppMap.set(child, replaceComment);
            return replaceComment;
        }
        return child;
    }
    return child;
}
/**
 * Handle the elements inserted into head and body, and execute normally in other cases
 * @param app app
 * @param method raw method
 * @param parent parent node
 * @param targetChild target node
 * @param passiveChild second param of insertBefore and replaceChild
 */
function invokePrototypeMethod(app, rawMethod, parent, targetChild, passiveChild) {
    /**
     * If passiveChild is not the child node, insertBefore replaceChild will have a problem, at this time, it will be degraded to appendChild
     * E.g: document.head.insertBefore(targetChild, document.head.childNodes[0])
     */
    if (parent === document.head) {
        const microAppHead = app.container.querySelector('micro-app-head');
        /**
         * 1. If passivechild exists, it must be insertBefore or replacechild
         * 2. When removeChild, targetChild may not be in microAppHead or head
         */
        if (passiveChild && !microAppHead.contains(passiveChild)) {
            return globalEnv.rawAppendChild.call(microAppHead, targetChild);
        }
        else if (rawMethod === globalEnv.rawRemoveChild && !microAppHead.contains(targetChild)) {
            if (parent.contains(targetChild)) {
                return rawMethod.call(parent, targetChild);
            }
            return targetChild;
        }
        else if (rawMethod === globalEnv.rawAppend || rawMethod === globalEnv.rawPrepend) {
            return rawMethod.call(microAppHead, targetChild);
        }
        return rawMethod.call(microAppHead, targetChild, passiveChild);
    }
    else if (parent === document.body) {
        const microAppBody = app.container.querySelector('micro-app-body');
        if (passiveChild && !microAppBody.contains(passiveChild)) {
            return globalEnv.rawAppendChild.call(microAppBody, targetChild);
        }
        else if (rawMethod === globalEnv.rawRemoveChild && !microAppBody.contains(targetChild)) {
            if (parent.contains(targetChild)) {
                return rawMethod.call(parent, targetChild);
            }
            return targetChild;
        }
        else if (rawMethod === globalEnv.rawAppend || rawMethod === globalEnv.rawPrepend) {
            return rawMethod.call(microAppBody, targetChild);
        }
        return rawMethod.call(microAppBody, targetChild, passiveChild);
    }
    else if (rawMethod === globalEnv.rawAppend || rawMethod === globalEnv.rawPrepend) {
        return rawMethod.call(parent, targetChild);
    }
    return rawMethod.call(parent, targetChild, passiveChild);
}
// Get the map element
function getMappingNode(node) {
    var _a;
    return (_a = dynamicElementInMicroAppMap.get(node)) !== null && _a !== void 0 ? _a : node;
}
/**
 * method of handle new node
 * @param parent parent node
 * @param newChild new node
 * @param passiveChild passive node
 * @param rawMethodraw method
 */
function commonElementHander(parent, newChild, passiveChild, rawMethod) {
    if (newChild === null || newChild === void 0 ? void 0 : newChild.__MICRO_APP_NAME__) {
        const app = appInstanceMap.get(newChild.__MICRO_APP_NAME__);
        if (app === null || app === void 0 ? void 0 : app.container) {
            return invokePrototypeMethod(app, rawMethod, parent, handleNewNode(parent, newChild, app), passiveChild && getMappingNode(passiveChild));
        }
        else if (rawMethod === globalEnv.rawAppend || rawMethod === globalEnv.rawPrepend) {
            return rawMethod.call(parent, newChild);
        }
        return rawMethod.call(parent, newChild, passiveChild);
    }
    else if (rawMethod === globalEnv.rawAppend || rawMethod === globalEnv.rawPrepend) {
        const appName = getCurrentAppName();
        if (!(newChild instanceof Node) && appName) {
            const app = appInstanceMap.get(appName);
            if (app === null || app === void 0 ? void 0 : app.container) {
                if (parent === document.head) {
                    return rawMethod.call(app.container.querySelector('micro-app-head'), newChild);
                }
                else if (parent === document.body) {
                    return rawMethod.call(app.container.querySelector('micro-app-body'), newChild);
                }
            }
        }
        return rawMethod.call(parent, newChild);
    }
    return rawMethod.call(parent, newChild, passiveChild);
}
/**
 * Rewrite element prototype method
 */
function patchElementPrototypeMethods() {
    patchDocument();
    // Rewrite setAttribute
    Element.prototype.setAttribute = function setAttribute(key, value) {
        if (/^micro-app(-\S+)?/i.test(this.tagName) && key === 'data') {
            if (isPlainObject(value)) {
                const cloneValue = {};
                Object.getOwnPropertyNames(value).forEach((propertyKey) => {
                    if (!(isString(propertyKey) && propertyKey.indexOf('__') === 0)) {
                        // @ts-ignore
                        cloneValue[propertyKey] = value[propertyKey];
                    }
                });
                this.data = cloneValue;
            }
            else if (value !== '[object Object]') {
                logWarn('property data must be an object', this.getAttribute('name'));
            }
        }
        else if (((key === 'src' && /^(img|script)$/i.test(this.tagName)) ||
            (key === 'href' && /^link$/i.test(this.tagName))) &&
            this.__MICRO_APP_NAME__ &&
            appInstanceMap.has(this.__MICRO_APP_NAME__)) {
            const app = appInstanceMap.get(this.__MICRO_APP_NAME__);
            globalEnv.rawSetAttribute.call(this, key, CompletionPath(value, app.url));
        }
        else {
            globalEnv.rawSetAttribute.call(this, key, value);
        }
    };
    // prototype methods of add element👇
    Node.prototype.appendChild = function appendChild(newChild) {
        return commonElementHander(this, newChild, null, globalEnv.rawAppendChild);
    };
    Node.prototype.insertBefore = function insertBefore(newChild, refChild) {
        return commonElementHander(this, newChild, refChild, globalEnv.rawInsertBefore);
    };
    Node.prototype.replaceChild = function replaceChild(newChild, oldChild) {
        return commonElementHander(this, newChild, oldChild, globalEnv.rawReplaceChild);
    };
    Element.prototype.append = function append(...nodes) {
        let i = 0;
        const length = nodes.length;
        while (i < length) {
            commonElementHander(this, nodes[i], null, globalEnv.rawAppend);
            i++;
        }
    };
    Element.prototype.prepend = function prepend(...nodes) {
        let i = nodes.length;
        while (i > 0) {
            commonElementHander(this, nodes[i - 1], null, globalEnv.rawPrepend);
            i--;
        }
    };
    // prototype methods of delete element👇
    Node.prototype.removeChild = function removeChild(oldChild) {
        if (oldChild === null || oldChild === void 0 ? void 0 : oldChild.__MICRO_APP_NAME__) {
            const app = appInstanceMap.get(oldChild.__MICRO_APP_NAME__);
            if (app === null || app === void 0 ? void 0 : app.container) {
                return invokePrototypeMethod(app, globalEnv.rawRemoveChild, this, getMappingNode(oldChild));
            }
            return globalEnv.rawRemoveChild.call(this, oldChild);
        }
        return globalEnv.rawRemoveChild.call(this, oldChild);
    };
}
/**
 * Mark the newly created element in the micro application
 * @param element new element
 */
function markElement(element) {
    const appName = getCurrentAppName();
    if (appName) {
        element.__MICRO_APP_NAME__ = appName;
    }
    return element;
}
// methods of document
function patchDocument() {
    const rawDocument = globalEnv.rawDocument;
    // create element 👇
    Document.prototype.createElement = function createElement(tagName, options) {
        const element = globalEnv.rawCreateElement.call(rawDocument, tagName, options);
        return markElement(element);
    };
    Document.prototype.createElementNS = function createElementNS(namespaceURI, name, options) {
        const element = globalEnv.rawCreateElementNS.call(rawDocument, namespaceURI, name, options);
        return markElement(element);
    };
    Document.prototype.createDocumentFragment = function createDocumentFragment() {
        const element = globalEnv.rawCreateDocumentFragment.call(rawDocument);
        return markElement(element);
    };
    // query element👇
    function querySelector(selectors) {
        var _a, _b, _c;
        const appName = getCurrentAppName();
        if (!appName || selectors === 'head' || selectors === 'body' || selectors === 'html') {
            return globalEnv.rawQuerySelector.call(rawDocument, selectors);
        }
        return (_c = (_b = (_a = appInstanceMap.get(appName)) === null || _a === void 0 ? void 0 : _a.container) === null || _b === void 0 ? void 0 : _b.querySelector(selectors)) !== null && _c !== void 0 ? _c : null;
    }
    function querySelectorAll(selectors) {
        var _a, _b, _c;
        const appName = getCurrentAppName();
        if (!appName || selectors === 'head' || selectors === 'body' || selectors === 'html') {
            return globalEnv.rawQuerySelectorAll.call(rawDocument, selectors);
        }
        return (_c = (_b = (_a = appInstanceMap.get(appName)) === null || _a === void 0 ? void 0 : _a.container) === null || _b === void 0 ? void 0 : _b.querySelectorAll(selectors)) !== null && _c !== void 0 ? _c : [];
    }
    Document.prototype.querySelector = querySelector;
    Document.prototype.querySelectorAll = querySelectorAll;
    // querySelector does not support the beginning of a number
    Document.prototype.getElementById = function getElementById(key) {
        const appName = getCurrentAppName();
        if (!appName || /^\d/.test(key)) {
            return globalEnv.rawGetElementById.call(rawDocument, key);
        }
        return querySelector(`#${key}`);
    };
    Document.prototype.getElementsByClassName = function getElementsByClassName(key) {
        const appName = getCurrentAppName();
        if (!appName || /^\d/.test(key)) {
            return globalEnv.rawGetElementsByClassName.call(rawDocument, key);
        }
        return querySelectorAll(`.${key}`);
    };
    Document.prototype.getElementsByTagName = function getElementsByTagName(key) {
        var _a;
        const appName = getCurrentAppName();
        if (!appName ||
            /^body$/i.test(key) ||
            /^head$/i.test(key) ||
            /^html$/i.test(key) ||
            (!((_a = appInstanceMap.get(appName)) === null || _a === void 0 ? void 0 : _a.inline) && /^script$/i.test(key))) {
            return globalEnv.rawGetElementsByTagName.call(rawDocument, key);
        }
        return querySelectorAll(key);
    };
    Document.prototype.getElementsByName = function getElementsByName(key) {
        const appName = getCurrentAppName();
        if (!appName || /^\d/.test(key)) {
            return globalEnv.rawGetElementsByName.call(rawDocument, key);
        }
        return querySelectorAll(`[name=${key}]`);
    };
}
function releasePatchDocument() {
    Document.prototype.createElement = globalEnv.rawCreateElement;
    Document.prototype.createElementNS = globalEnv.rawCreateElementNS;
    Document.prototype.createDocumentFragment = globalEnv.rawCreateDocumentFragment;
    Document.prototype.querySelector = globalEnv.rawQuerySelector;
    Document.prototype.querySelectorAll = globalEnv.rawQuerySelectorAll;
    Document.prototype.getElementById = globalEnv.rawGetElementById;
    Document.prototype.getElementsByClassName = globalEnv.rawGetElementsByClassName;
    Document.prototype.getElementsByTagName = globalEnv.rawGetElementsByTagName;
    Document.prototype.getElementsByName = globalEnv.rawGetElementsByName;
}
// release patch
function releasePatches() {
    setCurrentAppName(null);
    releasePatchDocument();
    Element.prototype.setAttribute = globalEnv.rawSetAttribute;
    Node.prototype.appendChild = globalEnv.rawAppendChild;
    Node.prototype.insertBefore = globalEnv.rawInsertBefore;
    Node.prototype.replaceChild = globalEnv.rawReplaceChild;
    Node.prototype.removeChild = globalEnv.rawRemoveChild;
    Element.prototype.append = globalEnv.rawAppend;
    Element.prototype.prepend = globalEnv.rawPrepend;
}
// Set the style of micro-app-head and micro-app-body
let hasRejectMicroAppStyle = false;
function rejectMicroAppStyle() {
    if (!hasRejectMicroAppStyle) {
        hasRejectMicroAppStyle = true;
        const style = pureCreateElement('style');
        style.setAttribute('type', 'text/css');
        style.textContent = `\n${microApp.tagName}, micro-app-body { display: block; } \nmicro-app-head { display: none; }`;
        globalEnv.rawDocument.head.appendChild(style);
    }
}

function unmountNestedApp() {
    replaseUnmountOfNestedApp();
    appInstanceMap.forEach(app => {
        let element = app.container;
        if (element) {
            if (element instanceof ShadowRoot) {
                element = element.host;
            }
            // @ts-ignore
            element.disconnectedCallback();
        }
    });
    if (!window.__MICRO_APP_UMD_MODE__)
        appInstanceMap.clear();
    if (elementInstanceMap.size) {
        elementInstanceMap.clear();
        releasePatches();
    }
}
// if micro-app run in micro application, delete all next generation application when unmount event received
function listenUmountOfNestedApp() {
    if (window.__MICRO_APP_ENVIRONMENT__) {
        window.addEventListener('unmount', unmountNestedApp, false);
    }
}
// release listener
function replaseUnmountOfNestedApp() {
    if (window.__MICRO_APP_ENVIRONMENT__) {
        window.removeEventListener('unmount', unmountNestedApp, false);
    }
}

function eventHandler$1(event, element) {
    Object.defineProperties(event, {
        currentTarget: {
            get() {
                return element;
            }
        },
        target: {
            get() {
                return element;
            }
        },
    });
}
/**
 * dispatch lifeCycles event
 * @param element container
 * @param appName app.name
 * @param lifecycleName lifeCycle name
 * @param error param from error hook
 */
function dispatchLifecyclesEvent(element, appName, lifecycleName, error) {
    var _a;
    if (!element) {
        return logError(`element does not exist in lifecycle ${lifecycleName}，it seems the app has unmounted`, appName);
    }
    else if (element instanceof ShadowRoot) {
        element = element.host;
    }
    const detail = Object.assign({
        name: appName,
        container: element,
    }, error && {
        error
    });
    const event = new CustomEvent(lifecycleName, {
        detail,
    });
    eventHandler$1(event, element);
    // global hooks
    // @ts-ignore
    if (isFunction((_a = microApp.lifeCycles) === null || _a === void 0 ? void 0 : _a[lifecycleName])) {
        // @ts-ignore
        microApp.lifeCycles[lifecycleName](event);
    }
    element.dispatchEvent(event);
}
/**
 * Dispatch unmount event to micro app
 * @param appName app.name
 */
function dispatchUnmountToMicroApp(appName) {
    const event = new CustomEvent(`unmount-${appName}`);
    window.dispatchEvent(event);
}

// record all micro-app elements
const elementInstanceMap = new Map();
/**
 * define element
 * @param tagName element name
 */
function defineElement(tagName) {
    class MicroAppElement extends HTMLElement {
        constructor() {
            super();
            this.appName = '';
            this.appUrl = '';
            this.version = version;
            this.isWating = false;
            this.cacheData = null;
            this.hasConnected = false;
            /**
             * handle for change of name an url after element inited
             */
            this.handleAttributeUpdate = () => {
                var _a;
                this.isWating = false;
                const attrName = this.getAttribute('name');
                const attrUrl = formatURL(this.getAttribute('url'), this.appName);
                if (this.legalAttribute('name', attrName) && this.legalAttribute('url', attrUrl)) {
                    const existApp = appInstanceMap.get(attrName);
                    if (attrName !== this.appName && existApp) {
                        // handling of cached and non-prefetch apps
                        if (appStatus.UNMOUNT !== existApp.getAppStatus() && !existApp.isPrefetch) {
                            this.setAttribute('name', this.appName);
                            return logError(`an app named ${attrName} already exists`, this.appName);
                        }
                    }
                    if (attrName !== this.appName || attrUrl !== this.appUrl) {
                        this.handleUnmount(attrName === this.appName);
                        this.appName = attrName;
                        this.appUrl = attrUrl;
                        ((_a = this.shadowRoot) !== null && _a !== void 0 ? _a : this).innerHTML = '';
                        /**
                         * when existApp not undefined
                         * if attrName and this.appName are equal, existApp has been unmounted
                         * if attrName and this.appName are not equal, existApp is prefetch or unmounted
                         */
                        if (existApp && existApp.url === attrUrl) {
                            // mount app
                            this.handleAppMount(existApp);
                        }
                        else {
                            this.handleCreate();
                        }
                    }
                }
                else if (attrName !== this.appName) {
                    this.setAttribute('name', this.appName);
                }
            };
            // cloned node of umd container also trigger constructor, we should skip
            if (!this.querySelector('micro-app-head')) {
                this.performWhenFirstCreated();
            }
        }
        static get observedAttributes() {
            return ['name', 'url'];
        }
        // 👇 Configuration
        // shadowDom: use shadowDOM, default is false
        // destory: whether delete cache resources when unmount, default is false
        // inline: whether js runs in inline script mode, default is false
        // disableScopecss: whether disable css scoped, default is false
        // disableSandbox: whether disable sandbox, default is false
        // macro: used to solve the async render problem of vue3, default is false
        // baseRoute: route prefix, default is ''
        connectedCallback() {
            this.hasConnected = true;
            if (!elementInstanceMap.has(this)) {
                this.performWhenFirstCreated();
            }
            defer(() => dispatchLifecyclesEvent(this, this.appName, lifeCycles.CREATED));
            this.initialMount();
        }
        disconnectedCallback() {
            this.hasConnected = false;
            elementInstanceMap.delete(this);
            this.handleUnmount(this.getDisposeResult('destory'));
            if (elementInstanceMap.size === 0) {
                releasePatches();
            }
        }
        attributeChangedCallback(attr, _oldVal, newVal) {
            if (this.legalAttribute(attr, newVal) &&
                this[attr === ObservedAttrName.NAME ? 'appName' : 'appUrl'] !== newVal) {
                if (attr === ObservedAttrName.URL && !this.appUrl) {
                    newVal = formatURL(newVal, this.appName);
                    if (!newVal) {
                        return logError('Invalid attribute url', this.appName);
                    }
                    this.appUrl = newVal;
                    this.handleInitialNameAndUrl();
                }
                else if (attr === ObservedAttrName.NAME && !this.appName) {
                    if (this.cacheData) {
                        microApp.setData(newVal, this.cacheData);
                        this.cacheData = null;
                    }
                    this.appName = newVal;
                    this.handleInitialNameAndUrl();
                }
                else if (!this.isWating) {
                    this.isWating = true;
                    defer(this.handleAttributeUpdate);
                }
            }
        }
        // handle for connectedCallback run before attributeChangedCallback
        handleInitialNameAndUrl() {
            if (this.hasConnected) {
                this.initialMount();
            }
        }
        // Perform global initialization when the element count is 1
        performWhenFirstCreated() {
            if (elementInstanceMap.set(this, true).size === 1) {
                patchElementPrototypeMethods();
                rejectMicroAppStyle();
                replaseUnmountOfNestedApp();
                listenUmountOfNestedApp();
            }
        }
        /**
         * first mount of this app
         */
        initialMount() {
            if (!this.appName || !this.appUrl)
                return;
            if (this.getDisposeResult('shadowDOM') && !this.shadowRoot) {
                this.attachShadow({ mode: 'open' });
            }
            const app = appInstanceMap.get(this.appName);
            if (app) {
                if (app.url === this.appUrl && (app.isPrefetch ||
                    app.getAppStatus() === appStatus.UNMOUNT)) {
                    this.handleAppMount(app);
                }
                else if (app.isPrefetch) {
                    logError(`the url ${this.appUrl} is different from prefetch url ${app.url}`, this.appName);
                }
                else {
                    logError(`an app named ${this.appName} already exists`, this.appName);
                }
            }
            else {
                this.handleCreate();
            }
        }
        /**
         * judge the attribute is legal
         * @param name attribute name
         * @param val attribute value
         */
        legalAttribute(name, val) {
            if (!isString(val) || !val) {
                logError(`unexpected attribute ${name}, please check again`, this.appName);
                return false;
            }
            return true;
        }
        /**
         * mount app
         * some serious note before mount:
         * 1. is prefetch ?
         * 2. is remount in another container ?
         * 3. is remount with change properties of the container ?
         */
        handleAppMount(app) {
            app.isPrefetch = false;
            defer(() => {
                var _a;
                return app.mount((_a = this.shadowRoot) !== null && _a !== void 0 ? _a : this, this.getDisposeResult('inline'), this.getBaseRouteCompatible());
            });
        }
        // create app instance
        handleCreate() {
            var _a;
            const instance = new CreateApp({
                name: this.appName,
                url: this.appUrl,
                container: (_a = this.shadowRoot) !== null && _a !== void 0 ? _a : this,
                inline: this.getDisposeResult('inline'),
                scopecss: !(this.getDisposeResult('disableScopecss') || this.getDisposeResult('shadowDOM')),
                useSandbox: !this.getDisposeResult('disableSandbox'),
                macro: this.getDisposeResult('macro'),
                baseroute: this.getBaseRouteCompatible(),
            });
            appInstanceMap.set(this.appName, instance);
        }
        /**
         * unmount app
         * @param destory delete cache resources when unmount
         */
        handleUnmount(destory) {
            const app = appInstanceMap.get(this.appName);
            if (app && appStatus.UNMOUNT !== app.getAppStatus())
                app.unmount(destory);
        }
        /**
         * Get configuration
         * Global setting is lowest priority
         * @param name Configuration item name
         */
        getDisposeResult(name) {
            // @ts-ignore
            return (this.hasAttribute(name) || microApp[name]) && this.getAttribute(name) !== 'false';
        }
        /**
         * 2021-09-08
         * get baseRoute
         * getAttribute('baseurl') is compatible writing of versions below 0.3.1
         */
        getBaseRouteCompatible() {
            var _a, _b;
            return (_b = (_a = this.getAttribute('baseroute')) !== null && _a !== void 0 ? _a : this.getAttribute('baseurl')) !== null && _b !== void 0 ? _b : '';
        }
        /**
         * Data from the base application
         */
        set data(value) {
            if (this.appName) {
                microApp.setData(this.appName, value);
            }
            else {
                this.cacheData = value;
            }
        }
        /**
         * get data only used in jsx-custom-event once
         */
        get data() {
            if (this.appName) {
                return microApp.getData(this.appName, true);
            }
            else if (this.cacheData) {
                return this.cacheData;
            }
            return null;
        }
    }
    window.customElements.define(tagName, MicroAppElement);
}

class EventCenter {
    constructor() {
        this.eventList = new Map();
    }
    // whether the name is legal
    isLegalName(name) {
        if (!name) {
            logError('event-center: Invalid name');
            return false;
        }
        return true;
    }
    /**
     * add listener
     * @param name event name
     * @param f listener
     * @param autoTrigger If there is cached data when first bind listener, whether it needs to trigger, default is false
     */
    on(name, f, autoTrigger = false) {
        if (this.isLegalName(name)) {
            if (!isFunction(f)) {
                return logError('event-center: Invalid callback function');
            }
            let eventInfo = this.eventList.get(name);
            if (!eventInfo) {
                eventInfo = {
                    data: {},
                    callbacks: new Set(),
                };
                this.eventList.set(name, eventInfo);
            }
            else if (autoTrigger && Object.getOwnPropertyNames(eventInfo.data).length) {
                // auto trigger when data not null
                f(eventInfo.data);
            }
            eventInfo.callbacks.add(f);
        }
    }
    // remove listener, but the data is not cleared
    off(name, f) {
        if (this.isLegalName(name)) {
            const eventInfo = this.eventList.get(name);
            if (eventInfo) {
                if (isFunction(f)) {
                    eventInfo.callbacks.delete(f);
                }
                else {
                    eventInfo.callbacks.clear();
                }
            }
        }
    }
    // dispatch data
    dispatch(name, data) {
        if (this.isLegalName(name)) {
            if (!isPlainObject(data)) {
                return logError('event-center: data must be object');
            }
            let eventInfo = this.eventList.get(name);
            if (eventInfo) {
                // Update when the data is not equal
                if (eventInfo.data !== data) {
                    eventInfo.data = data;
                    for (const f of eventInfo.callbacks) {
                        f(data);
                    }
                }
            }
            else {
                eventInfo = {
                    data: data,
                    callbacks: new Set(),
                };
                this.eventList.set(name, eventInfo);
            }
        }
    }
    // get data
    getData(name) {
        var _a;
        const eventInfo = this.eventList.get(name);
        return (_a = eventInfo === null || eventInfo === void 0 ? void 0 : eventInfo.data) !== null && _a !== void 0 ? _a : null;
    }
}

const eventCenter = new EventCenter();
/**
 * Format event name
 * @param appName app.name
 * @param fromBaseApp is from base app
 */
function formatEventName(appName, fromBaseApp) {
    if (!isString(appName) || !appName)
        return '';
    return fromBaseApp ? `__from_base_app_${appName}__` : `__from_micro_app_${appName}__`;
}
// Global data
class EventCenterForGlobal {
    /**
     * add listener of global data
     * @param cb listener
     * @param autoTrigger If there is cached data when first bind listener, whether it needs to trigger, default is false
     */
    addGlobalDataListener(cb, autoTrigger) {
        const appName = this.appName;
        // if appName exists, this is in sub app
        if (appName) {
            cb.__APP_NAME__ = appName;
            cb.__AUTO_TRIGGER__ = autoTrigger;
        }
        eventCenter.on('global', cb, autoTrigger);
    }
    /**
     * remove listener of global data
     * @param cb listener
     */
    removeGlobalDataListener(cb) {
        if (isFunction(cb)) {
            eventCenter.off('global', cb);
        }
    }
    /**
     * dispatch global data
     * @param data data
     */
    setGlobalData(data) {
        eventCenter.dispatch('global', data);
    }
    /**
     * clear all listener of global data
     * if appName exists, only the specified functions is cleared
     * if appName not exists, only clear the base app functions
     */
    clearGlobalDataListener() {
        const appName = this.appName;
        const eventInfo = eventCenter.eventList.get('global');
        if (eventInfo) {
            for (const cb of eventInfo.callbacks) {
                if ((appName && appName === cb.__APP_NAME__) ||
                    !(appName || cb.__APP_NAME__)) {
                    eventInfo.callbacks.delete(cb);
                }
            }
        }
    }
}
// Event center for base app
class EventCenterForBaseApp extends EventCenterForGlobal {
    /**
     * add listener
     * @param appName app.name
     * @param cb listener
     * @param autoTrigger If there is cached data when first bind listener, whether it needs to trigger, default is false
     */
    addDataListener(appName, cb, autoTrigger) {
        eventCenter.on(formatEventName(appName, false), cb, autoTrigger);
    }
    /**
     * remove listener
     * @param appName app.name
     * @param cb listener
     */
    removeDataListener(appName, cb) {
        if (isFunction(cb)) {
            eventCenter.off(formatEventName(appName, false), cb);
        }
    }
    /**
     * get data from micro app or base app
     * @param appName app.name
     * @param fromBaseApp whether get data from base app, default is false
     */
    getData(appName, fromBaseApp = false) {
        return eventCenter.getData(formatEventName(appName, fromBaseApp));
    }
    /**
     * Dispatch data to the specified micro app
     * @param appName app.name
     * @param data data
     */
    setData(appName, data) {
        eventCenter.dispatch(formatEventName(appName, true), data);
    }
    /**
     * clear all listener for specified micro app
     * @param appName app.name
     */
    clearDataListener(appName) {
        eventCenter.off(formatEventName(appName, false));
    }
}
// Event center for sub app
class EventCenterForMicroApp extends EventCenterForGlobal {
    constructor(appName) {
        super();
        this.appName = appName;
    }
    /**
     * add listener, monitor the data sent by the base app
     * @param cb listener
     * @param autoTrigger If there is cached data when first bind listener, whether it needs to trigger, default is false
     */
    addDataListener(cb, autoTrigger) {
        cb.__AUTO_TRIGGER__ = autoTrigger;
        eventCenter.on(formatEventName(this.appName, true), cb, autoTrigger);
    }
    /**
     * remove listener
     * @param cb listener
     */
    removeDataListener(cb) {
        if (isFunction(cb)) {
            eventCenter.off(formatEventName(this.appName, true), cb);
        }
    }
    /**
     * get data from base app
     */
    getData() {
        return eventCenter.getData(formatEventName(this.appName, true));
    }
    /**
     * dispatch data to base app
     * @param data data
     */
    dispatch(data) {
        removeDomScope();
        eventCenter.dispatch(formatEventName(this.appName, false), data);
        const app = appInstanceMap.get(this.appName);
        if ((app === null || app === void 0 ? void 0 : app.container) && isPlainObject(data)) {
            const event = new CustomEvent('datachange', {
                detail: {
                    data,
                }
            });
            let element = app.container;
            if (element instanceof ShadowRoot) {
                element = element.host;
            }
            element.dispatchEvent(event);
        }
    }
    /**
     * clear all listeners
     */
    clearDataListener() {
        eventCenter.off(formatEventName(this.appName, true));
    }
}
/**
 * Record UMD function before exec umdHookMount
 * @param microAppEventCneter
 */
function recordDataCenterSnapshot(microAppEventCneter) {
    const appName = microAppEventCneter.appName;
    microAppEventCneter.umdDataListeners = { global: new Set(), normal: new Set() };
    const globalEventInfo = eventCenter.eventList.get('global');
    if (globalEventInfo) {
        for (const cb of globalEventInfo.callbacks) {
            if (appName === cb.__APP_NAME__) {
                microAppEventCneter.umdDataListeners.global.add(cb);
            }
        }
    }
    const subAppEventInfo = eventCenter.eventList.get(formatEventName(appName, true));
    if (subAppEventInfo) {
        microAppEventCneter.umdDataListeners.normal = new Set(subAppEventInfo.callbacks);
    }
}
/**
 * Rebind the UMD function of the record before remount
 * @param microAppEventCneter instance of EventCenterForMicroApp
 */
function rebuildDataCenterSnapshot(microAppEventCneter) {
    for (const cb of microAppEventCneter.umdDataListeners.global) {
        microAppEventCneter.addGlobalDataListener(cb, cb.__AUTO_TRIGGER__);
    }
    for (const cb of microAppEventCneter.umdDataListeners.normal) {
        microAppEventCneter.addDataListener(cb, cb.__AUTO_TRIGGER__);
    }
}

class MicroApp extends EventCenterForBaseApp {
    constructor() {
        super(...arguments);
        this.tagName = 'micro-app';
        this.preFetch = preFetch;
    }
    start(options) {
        if (!isBrowser || !window.customElements) {
            return logError('micro-app is not supported in this environment');
        }
        if (options === null || options === void 0 ? void 0 : options.tagName) {
            if (/^micro-app(-\S+)?/.test(options.tagName)) {
                this.tagName = options.tagName;
            }
            else {
                return logError(`${options.tagName} is invalid tagName`);
            }
        }
        if (window.customElements.get(this.tagName)) {
            return logWarn(`element ${this.tagName} is already defined`);
        }
        initGloalEnv();
        if (options && isPlainObject(options)) {
            this.shadowDOM = options.shadowDOM;
            this.destory = options.destory;
            this.inline = options.inline;
            this.disableScopecss = options.disableScopecss;
            this.disableSandbox = options.disableSandbox;
            this.macro = options.macro;
            if (isFunction(options.fetch))
                this.fetch = options.fetch;
            if (isPlainObject(options.lifeCycles)) {
                this.lifeCycles = options.lifeCycles;
            }
            if (isPlainObject(options.plugins)) {
                this.plugins = options.plugins;
            }
            // load app assets when browser is idle
            if (options.preFetchApps) {
                preFetch(options.preFetchApps);
            }
            // load global assets when browser is idle
            if (options.globalAssets) {
                getGlobalAssets(options.globalAssets);
            }
        }
        defineElement(this.tagName);
    }
}
var microApp = new MicroApp();

/**
 * fetch source of html, js, css
 * @param url source path
 * @param appName app name
 * @param config config of fetch
 */
function fetchSource(url, appName = null, options = {}) {
    if (isFunction(microApp.fetch)) {
        return microApp.fetch(url, options, appName);
    }
    return fetch(url, options).then((res) => {
        return res.text();
    });
}

/**
 * transform html string to dom
 * @param str string dom
 */
function getWrapElement(str) {
    const wrapDiv = pureCreateElement('div');
    wrapDiv.innerHTML = str;
    return wrapDiv;
}
/**
 * Recursively process each child element
 * @param parent parent element
 * @param app app
 * @param microAppHead micro-app-head element
 */
function flatChildren(parent, app, microAppHead) {
    const children = Array.from(parent.children);
    children.length && children.forEach((child) => {
        flatChildren(child, app, microAppHead);
    });
    for (const dom of children) {
        if (dom instanceof HTMLLinkElement) {
            if (dom.hasAttribute('exclude')) {
                parent.replaceChild(document.createComment('link element with exclude attribute ignored by micro-app'), dom);
            }
            else if (app.scopecss && !dom.hasAttribute('ignore')) {
                extractLinkFromHtml(dom, parent, app, microAppHead);
            }
            else if (dom.hasAttribute('href')) {
                dom.setAttribute('href', CompletionPath(dom.getAttribute('href'), app.url));
            }
        }
        else if (dom instanceof HTMLStyleElement) {
            if (dom.hasAttribute('exclude')) {
                parent.replaceChild(document.createComment('style element with exclude attribute ignored by micro-app'), dom);
            }
            else if (app.scopecss && !dom.hasAttribute('ignore')) {
                microAppHead.appendChild(scopedCSS(dom, app.name));
            }
        }
        else if (dom instanceof HTMLScriptElement) {
            extractScriptElement(dom, parent, app);
        }
        else if (dom instanceof HTMLMetaElement || dom instanceof HTMLTitleElement) {
            parent.removeChild(dom);
        }
        else if (dom instanceof HTMLImageElement && dom.hasAttribute('src')) {
            dom.setAttribute('src', CompletionPath(dom.getAttribute('src'), app.url));
        }
    }
}
/**
 * Extract link and script, bind style scope
 * @param htmlStr html string
 * @param app app
 */
function extractSourceDom(htmlStr, app) {
    const wrapElement = getWrapElement(htmlStr);
    const microAppHead = wrapElement.querySelector('micro-app-head');
    const microAppBody = wrapElement.querySelector('micro-app-body');
    if (!microAppHead || !microAppBody) {
        const msg = `element ${microAppHead ? 'body' : 'head'} is missing`;
        app.onerror(new Error(msg));
        return logError(msg, app.name);
    }
    flatChildren(wrapElement, app, microAppHead);
    if (app.source.links.size) {
        fetchLinksFromHtml(wrapElement, app, microAppHead);
    }
    else {
        app.onLoad(wrapElement);
    }
    if (app.source.scripts.size) {
        fetchScriptsFromHtml(wrapElement, app);
    }
    else {
        app.onLoad(wrapElement);
    }
}
/**
 * Get and format html
 * @param app app
 */
function extractHtml(app) {
    fetchSource(app.url, app.name, { cache: 'no-cache' }).then((htmlStr) => {
        if (!htmlStr) {
            const msg = 'html is empty, please check in detail';
            app.onerror(new Error(msg));
            return logError(msg, app.name);
        }
        htmlStr = htmlStr
            .replace(/<head[^>]*>[\s\S]*?<\/head>/i, (match) => {
            return match
                .replace(/<head/i, '<micro-app-head')
                .replace(/<\/head>/i, '</micro-app-head>');
        })
            .replace(/<body[^>]*>[\s\S]*?<\/body>/i, (match) => {
            return match
                .replace(/<body/i, '<micro-app-body')
                .replace(/<\/body>/i, '</micro-app-body>');
        });
        extractSourceDom(htmlStr, app);
    }).catch((e) => {
        logError(`Failed to fetch data from ${app.url}, micro-app stop rendering`, app.name, e);
        app.onLoadError(e);
    });
}

const boundedMap = new WeakMap();
function isBoundedFunction(value) {
    if (boundedMap.has(value)) {
        return boundedMap.get(value);
    }
    // bind function
    const boundFunction = value.name.indexOf('bound ') === 0 && !value.hasOwnProperty('prototype');
    boundedMap.set(value, boundFunction);
    return boundFunction;
}
const constructorMap = new WeakMap();
function isConstructor(value) {
    if (constructorMap.has(value)) {
        return constructorMap.get(value);
    }
    const valueStr = value.toString();
    const result = (value.prototype &&
        value.prototype.constructor === value &&
        Object.getOwnPropertyNames(value.prototype).length > 1) ||
        /^function\s+[A-Z]/.test(valueStr) ||
        /^class\s+/.test(valueStr);
    constructorMap.set(value, result);
    return result;
}
const rawWindowMethodMap = new WeakMap();
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
function bindFunctionToRawWidow(rawWindow, value) {
    if (rawWindowMethodMap.has(value)) {
        return rawWindowMethodMap.get(value);
    }
    if (isFunction(value) && !isConstructor(value) && !isBoundedFunction(value)) {
        const bindRawWindowValue = value.bind(rawWindow);
        for (const key in value) {
            bindRawWindowValue[key] = value[key];
        }
        if (value.hasOwnProperty('prototype') && !bindRawWindowValue.hasOwnProperty('prototype')) {
            bindRawWindowValue.prototype = value.prototype;
        }
        rawWindowMethodMap.set(value, bindRawWindowValue);
        return bindRawWindowValue;
    }
    return value;
}

// document.onclick binding list, the binding function of each application is unique
const documentClickListMap = new Map();
let hasRewriteDocumentOnClick = false;
/**
 * Rewrite document.onclick and execute it only once
 */
function overwriteDocumentOnClick() {
    hasRewriteDocumentOnClick = true;
    const descriptor = Object.getOwnPropertyDescriptor(document, 'onclick');
    if ((descriptor === null || descriptor === void 0 ? void 0 : descriptor.configurable) === false) {
        return logWarn('Cannot redefine document property onclick');
    }
    const rawOnClick = document.onclick;
    document.onclick = null;
    let hasDocumentClickInited = false;
    function onClickHandler(e) {
        documentClickListMap.forEach((f) => {
            isFunction(f) && f.call(document, e);
        });
    }
    Object.defineProperty(document, 'onclick', {
        configurable: false,
        enumerable: true,
        get() {
            const appName = getCurrentAppName();
            return appName ? documentClickListMap.get(appName) : documentClickListMap.get('base');
        },
        set(f) {
            const appName = getCurrentAppName();
            if (appName) {
                documentClickListMap.set(appName, f);
            }
            else {
                documentClickListMap.set('base', f);
            }
            if (!hasDocumentClickInited && isFunction(f)) {
                hasDocumentClickInited = true;
                globalEnv.rawDocumentAddEventListener.call(globalEnv.rawDocument, 'click', onClickHandler, false);
            }
        }
    });
    if (rawOnClick) {
        document.onclick = rawOnClick;
    }
}
/**
 * The document event is globally, we need to clear these event bindings when micro application unmounted
 */
const documentEventListenerMap = new Map();
function effectDocumentEvent() {
    const { rawDocument, rawDocumentAddEventListener, rawDocumentRemoveEventListener, } = globalEnv;
    if (!hasRewriteDocumentOnClick) {
        overwriteDocumentOnClick();
    }
    document.addEventListener = function (type, listener, options) {
        const appName = getCurrentAppName();
        if (appName) {
            const appListenersMap = documentEventListenerMap.get(appName);
            if (appListenersMap) {
                const appListenerList = appListenersMap.get(type);
                if (appListenerList) {
                    appListenerList.add(listener);
                }
                else {
                    appListenersMap.set(type, new Set([listener]));
                }
            }
            else {
                documentEventListenerMap.set(appName, new Map([[type, new Set([listener])]]));
            }
            listener && (listener.__MICRO_MARK_OPTIONS__ = options);
        }
        rawDocumentAddEventListener.call(rawDocument, type, listener, options);
    };
    document.removeEventListener = function (type, listener, options) {
        const appName = getCurrentAppName();
        if (appName) {
            const appListenersMap = documentEventListenerMap.get(appName);
            if (appListenersMap) {
                const appListenerList = appListenersMap.get(type);
                if ((appListenerList === null || appListenerList === void 0 ? void 0 : appListenerList.size) && appListenerList.has(listener)) {
                    appListenerList.delete(listener);
                }
            }
        }
        rawDocumentRemoveEventListener.call(rawDocument, type, listener, options);
    };
}
// Clear the document event agent
function releaseEffectDocumentEvent() {
    document.addEventListener = globalEnv.rawDocumentAddEventListener;
    document.removeEventListener = globalEnv.rawDocumentRemoveEventListener;
}
/**
 * Format event name
 * @param type event name
 * @param microWindow micro window
 */
function formatEventType(type, microWindow) {
    if (type === 'unmount') {
        return `unmount-${microWindow.__MICRO_APP_NAME__}`;
    }
    return type;
}
/**
 * Rewrite side-effect events
 * @param microWindow micro window
 */
function effect(microWindow) {
    const appName = microWindow.__MICRO_APP_NAME__;
    const eventListenerMap = new Map();
    const intervalIdMap = new Map();
    const timeoutIdMap = new Map();
    const { rawWindow, rawDocument, rawWindowAddEventListener, rawWindowRemoveEventListener, rawSetInterval, rawSetTimeout, rawClearInterval, rawClearTimeout, rawDocumentRemoveEventListener, } = globalEnv;
    // listener may be null, e.g test-passive
    microWindow.addEventListener = function (type, listener, options) {
        type = formatEventType(type, microWindow);
        const listenerList = eventListenerMap.get(type);
        if (listenerList) {
            listenerList.add(listener);
        }
        else {
            eventListenerMap.set(type, new Set([listener]));
        }
        listener && (listener.__MICRO_MARK_OPTIONS__ = options);
        rawWindowAddEventListener.call(rawWindow, type, listener, options);
    };
    microWindow.removeEventListener = function (type, listener, options) {
        type = formatEventType(type, microWindow);
        const listenerList = eventListenerMap.get(type);
        if ((listenerList === null || listenerList === void 0 ? void 0 : listenerList.size) && listenerList.has(listener)) {
            listenerList.delete(listener);
        }
        rawWindowRemoveEventListener.call(rawWindow, type, listener, options);
    };
    microWindow.setInterval = function (handler, timeout, ...args) {
        const intervalId = rawSetInterval.call(rawWindow, handler, timeout, ...args);
        intervalIdMap.set(intervalId, { handler, timeout, args });
        return intervalId;
    };
    microWindow.setTimeout = function (handler, timeout, ...args) {
        const timeoutId = rawSetTimeout.call(rawWindow, handler, timeout, ...args);
        timeoutIdMap.set(timeoutId, { handler, timeout, args });
        return timeoutId;
    };
    microWindow.clearInterval = function (intervalId) {
        intervalIdMap.delete(intervalId);
        rawClearInterval.call(rawWindow, intervalId);
    };
    microWindow.clearTimeout = function (timeoutId) {
        timeoutIdMap.delete(timeoutId);
        rawClearTimeout.call(rawWindow, timeoutId);
    };
    const umdWindowListenerMap = new Map();
    const umdDocumentListenerMap = new Map();
    let umdIntervalIdMap = new Map();
    let umdTimeoutIdMap = new Map();
    let umdOnClickHandler;
    // record event and timer before exec umdMountHook
    const recordUmdEffect = () => {
        // record window event
        eventListenerMap.forEach((listenerList, type) => {
            if (listenerList.size) {
                umdWindowListenerMap.set(type, new Set(listenerList));
            }
        });
        // record timers
        if (intervalIdMap.size) {
            umdIntervalIdMap = new Map(intervalIdMap);
        }
        if (timeoutIdMap.size) {
            umdTimeoutIdMap = new Map(timeoutIdMap);
        }
        // record onclick handler
        umdOnClickHandler = documentClickListMap.get(appName);
        // record document event
        const documentAppListenersMap = documentEventListenerMap.get(appName);
        if (documentAppListenersMap) {
            documentAppListenersMap.forEach((listenerList, type) => {
                if (listenerList.size) {
                    umdDocumentListenerMap.set(type, new Set(listenerList));
                }
            });
        }
    };
    // rebuild event and timer before remount umd app
    const rebuildUmdEffect = () => {
        // rebuild window event
        umdWindowListenerMap.forEach((listenerList, type) => {
            for (const listener of listenerList) {
                microWindow.addEventListener(type, listener, listener === null || listener === void 0 ? void 0 : listener.__MICRO_MARK_OPTIONS__);
            }
        });
        // rebuild timer
        umdIntervalIdMap.forEach((info) => {
            microWindow.setInterval(info.handler, info.timeout, ...info.args);
        });
        umdTimeoutIdMap.forEach((info) => {
            microWindow.setTimeout(info.handler, info.timeout, ...info.args);
        });
        // rebuild onclick event
        umdOnClickHandler && documentClickListMap.set(appName, umdOnClickHandler);
        // rebuild document event
        setCurrentAppName(appName);
        umdDocumentListenerMap.forEach((listenerList, type) => {
            for (const listener of listenerList) {
                document.addEventListener(type, listener, listener === null || listener === void 0 ? void 0 : listener.__MICRO_MARK_OPTIONS__);
            }
        });
        setCurrentAppName(null);
    };
    // release all event listener & interval & timeout when unmount app
    const releaseEffect = () => {
        // Clear window binding events
        if (eventListenerMap.size) {
            eventListenerMap.forEach((listenerList, type) => {
                for (const listener of listenerList) {
                    rawWindowRemoveEventListener.call(rawWindow, type, listener);
                }
            });
            eventListenerMap.clear();
        }
        // Clear timers
        if (intervalIdMap.size) {
            intervalIdMap.forEach((_, intervalId) => {
                rawClearInterval.call(rawWindow, intervalId);
            });
            intervalIdMap.clear();
        }
        if (timeoutIdMap.size) {
            timeoutIdMap.forEach((_, timeoutId) => {
                rawClearTimeout.call(rawWindow, timeoutId);
            });
            timeoutIdMap.clear();
        }
        // Clear the function bound by micro application through document.onclick
        documentClickListMap.delete(appName);
        // Clear document binding event
        const documentAppListenersMap = documentEventListenerMap.get(appName);
        if (documentAppListenersMap) {
            documentAppListenersMap.forEach((listenerList, type) => {
                for (const listener of listenerList) {
                    rawDocumentRemoveEventListener.call(rawDocument, type, listener);
                }
            });
            documentAppListenersMap.clear();
        }
    };
    return {
        recordUmdEffect,
        rebuildUmdEffect,
        releaseEffect,
    };
}

// Variables that can escape to rawWindow
const staticEscapeProperties = [
    'System',
    '__cjsWrapper',
    '__REACT_ERROR_OVERLAY_GLOBAL_HOOK__',
];
// Variables that can only assigned to rawWindow
const escapeSetterKeyList = [
    'location',
];
const unscopables = {
    undefined: true,
    Array: true,
    Object: true,
    String: true,
    Boolean: true,
    Math: true,
    Number: true,
    Symbol: true,
    parseFloat: true,
    Float32Array: true,
};
/**
 * macro task to solve the rendering problem of vue3
 */
let macroTimer;
function macroTask(fn) {
    if (macroTimer)
        clearTimeout(macroTimer);
    macroTimer = setTimeout(fn, 0);
}
class SandBox {
    constructor(appName, url, macro) {
        this.active = false; // sandbox state
        // Scoped global Properties(Properties that can only get and set in microWindow, will not escape to rawWindow)
        this.scopeProperties = ['webpackJsonp'];
        // Properties that can be escape to rawWindow
        this.escapeProperties = [];
        this.microWindow = {}; // Proxy target
        this.injectedKeys = new Set(); // Properties newly added to microWindow
        this.escapeKeys = new Set(); // Properties escape to rawWindow, cleared when unmount
        const rawWindow = globalEnv.rawWindow;
        const rawDocument = globalEnv.rawDocument;
        const descriptorTargetMap = new Map();
        const hasOwnProperty = (key) => this.microWindow.hasOwnProperty(key) || rawWindow.hasOwnProperty(key);
        // get scopeProperties and escapeProperties from plugins
        this.getScopeProperties(appName);
        // inject global properties
        this.inject(this.microWindow, appName, url);
        // Rewrite global event listener & timeout
        Object.assign(this, effect(this.microWindow));
        this.proxyWindow = new Proxy(this.microWindow, {
            get: (target, key) => {
                if (key === Symbol.unscopables)
                    return unscopables;
                if (['window', 'self', 'globalThis'].includes(key)) {
                    return this.proxyWindow;
                }
                if (key === 'top' || key === 'parent') {
                    if (rawWindow === rawWindow.parent) { // not in iframe
                        return this.proxyWindow;
                    }
                    return Reflect.get(rawWindow, key); // iframe
                }
                if (key === 'hasOwnProperty')
                    return hasOwnProperty;
                if (key === 'document' || key === 'eval') {
                    if (this.active) {
                        setCurrentAppName(appName);
                        (macro ? macroTask : defer)(() => setCurrentAppName(null));
                    }
                    switch (key) {
                        case 'document':
                            return rawDocument;
                        case 'eval':
                            return eval;
                    }
                }
                if (Reflect.has(target, key)) {
                    return Reflect.get(target, key);
                }
                if (this.scopeProperties.includes(key) ||
                    (isString(key) && /^__MICRO_APP_/.test(key))) {
                    return Reflect.get(target, key);
                }
                const rawValue = Reflect.get(rawWindow, key);
                return bindFunctionToRawWidow(rawWindow, rawValue);
            },
            set: (target, key, value) => {
                if (this.active) {
                    if (escapeSetterKeyList.includes(key)) {
                        Reflect.set(rawWindow, key, value);
                    }
                    else if (!target.hasOwnProperty(key) &&
                        rawWindow.hasOwnProperty(key) &&
                        !this.scopeProperties.includes(key)) {
                        const descriptor = Object.getOwnPropertyDescriptor(rawWindow, key);
                        const { writable, configurable, enumerable } = descriptor;
                        if (writable) {
                            Object.defineProperty(target, key, {
                                configurable,
                                enumerable,
                                writable,
                                value,
                            });
                            this.injectedKeys.add(key);
                        }
                    }
                    else {
                        Reflect.set(target, key, value);
                        this.injectedKeys.add(key);
                    }
                    if ((this.escapeProperties.includes(key) ||
                        (staticEscapeProperties.includes(key) && !Reflect.has(rawWindow, key))) &&
                        !this.scopeProperties.includes(key)) {
                        Reflect.set(rawWindow, key, value);
                        this.escapeKeys.add(key);
                    }
                }
                return true;
            },
            has: (target, key) => {
                if (this.scopeProperties.includes(key))
                    return key in target;
                return key in unscopables || key in target || key in rawWindow;
            },
            getOwnPropertyDescriptor: (target, key) => {
                if (target.hasOwnProperty(key)) {
                    descriptorTargetMap.set(key, 'target');
                    return Object.getOwnPropertyDescriptor(target, key);
                }
                if (rawWindow.hasOwnProperty(key)) {
                    descriptorTargetMap.set(key, 'rawWindow');
                    const descriptor = Object.getOwnPropertyDescriptor(rawWindow, key);
                    if (descriptor && !descriptor.configurable) {
                        descriptor.configurable = true;
                    }
                    return descriptor;
                }
                return undefined;
            },
            defineProperty: (target, key, value) => {
                const from = descriptorTargetMap.get(key);
                if (from === 'rawWindow') {
                    return Reflect.defineProperty(rawWindow, key, value);
                }
                return Reflect.defineProperty(target, key, value);
            },
            ownKeys: (target) => {
                return unique(Reflect.ownKeys(rawWindow).concat(Reflect.ownKeys(target)));
            },
            deleteProperty: (target, key) => {
                if (target.hasOwnProperty(key)) {
                    if (this.escapeKeys.has(key)) {
                        Reflect.deleteProperty(rawWindow, key);
                    }
                    return Reflect.deleteProperty(target, key);
                }
                return true;
            },
        });
    }
    start(baseroute) {
        if (!this.active) {
            this.active = true;
            this.microWindow.__MICRO_APP_BASE_ROUTE__ = this.microWindow.__MICRO_APP_BASE_URL__ = baseroute;
            if (globalEnv.rawWindow._babelPolyfill)
                globalEnv.rawWindow._babelPolyfill = false;
            if (++SandBox.activeCount === 1) {
                effectDocumentEvent();
            }
        }
    }
    stop() {
        if (this.active) {
            this.active = false;
            this.releaseEffect();
            this.microWindow.microApp.clearDataListener();
            this.microWindow.microApp.clearGlobalDataListener();
            this.injectedKeys.forEach((key) => {
                Reflect.deleteProperty(this.microWindow, key);
            });
            this.injectedKeys.clear();
            this.escapeKeys.forEach((key) => {
                Reflect.deleteProperty(globalEnv.rawWindow, key);
            });
            this.escapeKeys.clear();
            if (--SandBox.activeCount === 0) {
                releaseEffectDocumentEvent();
            }
        }
    }
    // record umd snapshot before the first execution of umdHookMount
    recordUmdSnapshot() {
        this.microWindow.__MICRO_APP_UMD_MODE__ = true;
        this.recordUmdEffect();
        recordDataCenterSnapshot(this.microWindow.microApp);
        this.recordUmdinjectedValues = new Map();
        this.injectedKeys.forEach((key) => {
            this.recordUmdinjectedValues.set(key, Reflect.get(this.microWindow, key));
        });
    }
    // rebuild umd snapshot before remount umd app
    rebuildUmdSnapshot() {
        this.recordUmdinjectedValues.forEach((value, key) => {
            Reflect.set(this.proxyWindow, key, value);
        });
        this.rebuildUmdEffect();
        rebuildDataCenterSnapshot(this.microWindow.microApp);
    }
    /**
     * get scopeProperties and escapeProperties from plugins
     * @param appName app name
     */
    getScopeProperties(appName) {
        var _a;
        if (!isPlainObject(microApp.plugins))
            return;
        if (isArray(microApp.plugins.global)) {
            for (const plugin of microApp.plugins.global) {
                if (isPlainObject(plugin)) {
                    if (isArray(plugin.scopeProperties)) {
                        this.scopeProperties = this.scopeProperties.concat(plugin.scopeProperties);
                    }
                    if (isArray(plugin.escapeProperties)) {
                        this.escapeProperties = this.escapeProperties.concat(plugin.escapeProperties);
                    }
                }
            }
        }
        if (isArray((_a = microApp.plugins.modules) === null || _a === void 0 ? void 0 : _a[appName])) {
            for (const plugin of microApp.plugins.modules[appName]) {
                if (isPlainObject(plugin)) {
                    if (isArray(plugin.scopeProperties)) {
                        this.scopeProperties = this.scopeProperties.concat(plugin.scopeProperties);
                    }
                    if (isArray(plugin.escapeProperties)) {
                        this.escapeProperties = this.escapeProperties.concat(plugin.escapeProperties);
                    }
                }
            }
        }
    }
    /**
     * inject global properties to microWindow
     * @param microWindow micro window
     * @param appName app name
     * @param url app url
     */
    inject(microWindow, appName, url) {
        microWindow.__MICRO_APP_ENVIRONMENT__ = true;
        microWindow.__MICRO_APP_NAME__ = appName;
        microWindow.__MICRO_APP_PUBLIC_PATH__ = getEffectivePath(url);
        microWindow.microApp = new EventCenterForMicroApp(appName);
        microWindow.rawWindow = globalEnv.rawWindow;
        microWindow.rawDocument = globalEnv.rawDocument;
        microWindow.removeDomScope = removeDomScope;
    }
}
SandBox.activeCount = 0; // number of active sandbox

// micro app instances
const appInstanceMap = new Map();
class CreateApp {
    constructor({ name, url, container, inline, scopecss, useSandbox, macro, baseroute }) {
        this.status = appStatus.NOT_LOADED;
        this.loadSourceLevel = 0;
        this.umdHookMount = null;
        this.umdHookunMount = null;
        this.libraryName = null;
        this.umdMode = false;
        this.isPrefetch = false;
        this.container = null;
        this.macro = false;
        this.baseroute = '';
        this.sandBox = null;
        this.container = container !== null && container !== void 0 ? container : null;
        this.inline = inline !== null && inline !== void 0 ? inline : false;
        this.baseroute = baseroute !== null && baseroute !== void 0 ? baseroute : '';
        // optional during init👆
        this.name = name;
        this.url = url;
        this.useSandbox = useSandbox;
        this.scopecss = this.useSandbox && scopecss;
        this.macro = macro !== null && macro !== void 0 ? macro : false;
        this.source = {
            links: new Map(),
            scripts: new Map(),
        };
        this.loadSourceCode();
        if (this.useSandbox) {
            this.sandBox = new SandBox(name, url, this.macro);
        }
    }
    // Load resources
    loadSourceCode() {
        this.status = appStatus.LOADING_SOURCE_CODE;
        extractHtml(this);
    }
    /**
     * When resource is loaded, mount app if it is not prefetch or unmount
     */
    onLoad(html) {
        if (++this.loadSourceLevel === 2) {
            this.source.html = html;
            if (this.isPrefetch || appStatus.UNMOUNT === this.status)
                return;
            this.status = appStatus.LOAD_SOURCE_FINISHED;
            this.mount();
        }
    }
    /**
     * Error loading HTML
     * @param e Error
     */
    onLoadError(e) {
        this.loadSourceLevel = -1;
        if (appStatus.UNMOUNT !== this.status) {
            this.onerror(e);
            this.status = appStatus.LOAD_SOURCE_ERROR;
        }
    }
    /**
     * mount app
     * @param container app container
     * @param inline js runs in inline mode
     * @param baseroute route prefix, default is ''
     */
    mount(container, inline, baseroute) {
        var _a, _b, _c;
        if (isBoolean(inline) && inline !== this.inline) {
            this.inline = inline;
        }
        this.container = (_a = this.container) !== null && _a !== void 0 ? _a : container;
        this.baseroute = baseroute !== null && baseroute !== void 0 ? baseroute : this.baseroute;
        if (this.loadSourceLevel !== 2) {
            this.status = appStatus.LOADING_SOURCE_CODE;
            return;
        }
        dispatchLifecyclesEvent(this.container, this.name, lifeCycles.BEFOREMOUNT);
        this.status = appStatus.MOUNTING;
        cloneNode(this.source.html, this.container, !this.umdMode);
        (_b = this.sandBox) === null || _b === void 0 ? void 0 : _b.start(this.baseroute);
        if (!this.umdMode) {
            execScripts(this.source.scripts, this, (isFinished) => {
                var _a;
                if (isNull(this.umdHookMount)) {
                    const { mount, unmount } = this.getUmdLibraryHooks();
                    // if mount & unmount is function, the sub app is umd mode
                    if (isFunction(mount) && isFunction(unmount)) {
                        this.umdHookMount = mount;
                        this.umdHookunMount = unmount;
                        this.umdMode = true;
                        (_a = this.sandBox) === null || _a === void 0 ? void 0 : _a.recordUmdSnapshot();
                        this.umdHookMount();
                    }
                }
                if (isFinished === true) {
                    this.dispatchMountedEvent();
                }
            });
        }
        else {
            (_c = this.sandBox) === null || _c === void 0 ? void 0 : _c.rebuildUmdSnapshot();
            this.umdHookMount();
            this.dispatchMountedEvent();
        }
    }
    /**
     * dispatch mounted event when app run finished
     */
    dispatchMountedEvent() {
        if (appStatus.UNMOUNT !== this.status) {
            this.status = appStatus.MOUNTED;
            defer(() => {
                if (appStatus.UNMOUNT !== this.status) {
                    dispatchLifecyclesEvent(this.container, this.name, lifeCycles.MOUNTED);
                }
            });
        }
    }
    /**
     * unmount app
     * @param destory completely destroy, delete cache resources
     */
    unmount(destory) {
        var _a;
        if (this.status === appStatus.LOAD_SOURCE_ERROR) {
            destory = true;
        }
        this.status = appStatus.UNMOUNT;
        dispatchLifecyclesEvent(this.container, this.name, lifeCycles.UNMOUNT);
        // Send an unmount event to the micro app or call umd unmount hook
        // before the sandbox is cleared & after the unmount lifecycle is executed
        this.umdHookunMount && this.umdHookunMount();
        dispatchUnmountToMicroApp(this.name);
        (_a = this.sandBox) === null || _a === void 0 ? void 0 : _a.stop();
        // actions for completely destroy
        if (destory) {
            if (!this.useSandbox && this.umdMode) {
                delete window[this.libraryName];
            }
            appInstanceMap.delete(this.name);
        }
        else if (this.umdMode) {
            /**
            * In umd mode, ui frameworks will no longer create style elements to head in lazy load page when render again, so we should save container to keep these elements
            */
            cloneNode(this.container, this.source.html, false);
        }
        this.container = null;
    }
    /**
     * app rendering error
     * @param e Error
     */
    onerror(e) {
        dispatchLifecyclesEvent(this.container, this.name, lifeCycles.ERROR, e);
    }
    // get app status
    getAppStatus() {
        return this.status;
    }
    // get umd library, if it not exist, return empty object
    getUmdLibraryHooks() {
        var _a, _b;
        // after execScripts, the app maybe unmounted
        if (appStatus.UNMOUNT !== this.status) {
            const global = ((_b = (_a = this.sandBox) === null || _a === void 0 ? void 0 : _a.proxyWindow) !== null && _b !== void 0 ? _b : globalEnv.rawWindow);
            this.libraryName = (this.container instanceof ShadowRoot ? this.container.host : this.container).getAttribute('library') || `micro-app-${this.name}`;
            // do not use isObject
            return typeof global[this.libraryName] === 'object' ? global[this.libraryName] : {};
        }
        return {};
    }
}

function filterPreFetchTarget(apps) {
    const validApps = [];
    if (isArray(apps)) {
        apps.forEach((item) => {
            item.url = formatURL(item.url, item.name);
            if (isPlainObject(item) &&
                isString(item.name) &&
                item.url &&
                !appInstanceMap.has(item.name)) {
                validApps.push(item);
            }
        });
    }
    return validApps;
}
/**
 * preFetch([
 *  {
 *    name: string,
 *    url: string,
 *    disableScopecss?: boolean,
 *    disableSandbox?: boolean,
 *    macro?: boolean,
 *  },
 *  ...
 * ])
 * Note:
 *  1: preFetch is asynchronous and is performed only when the browser is idle
 *  2: disableScopecss, disableSandbox, macro must be same with micro-app element, if conflict, the one who executes first shall prevail
 * @param apps micro apps
 */
function preFetch(apps) {
    if (!isBrowser) {
        return logError('preFetch is only supported in browser environment');
    }
    requestIdleCallback(() => {
        if (isFunction(apps))
            apps = apps();
        filterPreFetchTarget(apps).forEach((item) => {
            var _a, _b, _c;
            const app = new CreateApp({
                name: item.name,
                url: item.url,
                scopecss: !((_a = item.disableScopecss) !== null && _a !== void 0 ? _a : microApp.disableScopecss),
                useSandbox: !((_b = item.disableSandbox) !== null && _b !== void 0 ? _b : microApp.disableSandbox),
                macro: (_c = item.macro) !== null && _c !== void 0 ? _c : microApp.macro,
            });
            app.isPrefetch = true;
            appInstanceMap.set(item.name, app);
        });
    });
}
/**
 * load global assets into cache
 * @param assets global assets of js, css
 */
function getGlobalAssets(assets) {
    if (isPlainObject(assets)) {
        requestIdleCallback(() => {
            if (isArray(assets.js)) {
                const effectiveJs = assets.js.filter((path) => isString(path) && path.includes('.js') && !globalScripts.has(path));
                const fetchJSPromise = [];
                effectiveJs.forEach((path) => {
                    fetchJSPromise.push(fetchSource(path));
                });
                // fetch js with stream
                promiseStream(fetchJSPromise, (res) => {
                    const path = effectiveJs[res.index];
                    if (!globalScripts.has(path)) {
                        globalScripts.set(path, res.data);
                    }
                }, (err) => {
                    logError(err);
                });
            }
            if (isArray(assets.css)) {
                const effectiveCss = assets.css.filter((path) => isString(path) && path.includes('.css') && !globalLinks.has(path));
                const fetchCssPromise = [];
                effectiveCss.forEach((path) => {
                    fetchCssPromise.push(fetchSource(path));
                });
                // fetch css with stream
                promiseStream(fetchCssPromise, (res) => {
                    const path = effectiveCss[res.index];
                    if (!globalLinks.has(path)) {
                        globalLinks.set(path, res.data);
                    }
                }, (err) => {
                    logError(err);
                });
            }
        });
    }
}

export default microApp;
export { preFetch, pureCreateElement, removeDomScope, setCurrentAppName, version };
//# sourceMappingURL=index.esm.js.map
