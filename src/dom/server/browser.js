import {setJSDOM, unsetJSDOM, default as DOCUMENT} from './document';
import {setJSWindow, unsetJSWindow, default as WINDOW} from './window';

function runInBrowserContext(func, dom = DOCUMENT, win = WINDOW, ...args) {
    setJSDOM(dom);
    setJSWindow(win);
    const output = func(...args);
    unsetJSDOM();
    unsetJSWindow();
    return output;
}

export {
    runInBrowserContext
};
