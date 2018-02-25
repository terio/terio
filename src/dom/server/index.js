import {runInBrowserContext} from './browser';
import {TERIO_ROOT} from '../../constants/attr';
import {create as createVirtualNode} from '../../vdom/node';
import {isString} from '../../utils/type';

function reduceNodeToString(node, isRoot = false) {
    if(isString(node)) {
        return node;
    }
    let str = '';
    let attrs = node.props.toString();
    if(isRoot) {
        attrs = [attrs, TERIO_ROOT].join(' ');
    }
    if(node.isSelfClosing) {
        return `<${node.type}${attrs ? ` ${attrs}` : ''}/>`;
    }
    str += `<${node.type}${attrs ? ` ${attrs}` : ''}>`;
    str = node.children
        .reduce((pv, cv) => {
            return pv + reduceNodeToString(cv);
        }, str);
    return str + `</${node.type}>`;
}

function renderToString(node, dom, win) {
    return runInBrowserContext(reduceNodeToString, dom, win, node.inflate(), true);
}

export {
    renderToString
};
