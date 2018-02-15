import {setJSDOM, unsetJSDOM}, DOCUMENT from './document';
import {setJSWindow, unsetJSWindow}, WINDOW from './window';

function runInBrowserContextSync(func, dom = DOCUMENT, win = WINDOW, ...args) {
    setJSDOM(dom);
    setJSWindow(win);
    func(...args);
    unsetJSDOM();
    unsetJSWindow();
}

export {
    runInBrowserContext
};
