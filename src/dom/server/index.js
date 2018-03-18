import {runInBrowserContext} from './browser';
import {TERIO_ROOT} from '../../constants/attr';
import {create as createVirtualNode} from '../../vdom/node';
import {isString} from '../../utils/type';
import Prop from '../../vdom/prop';
import {isPlaceHolder} from '../../vdom/placeholder';
import {isFragment} from '../../vdom/fragment';

function reduceNodeToString(node) {
    if(isString(node)) {
        return node;
    }
    if(isPlaceHolder(node)) {
        return '';
    }
    if(isFragment(node)) {
        return node.reduce((pv, cv) => pv + reduceNodeToString(cv), '');;
    }
    let str = '';
    let attrs = node.props.toString();
    if(node.isSelfClosing) {
        return `<${node.type}${attrs ? ` ${attrs}` : ''}/>`;
    }
    str += `<${node.type}${attrs ? ` ${attrs}` : ''}>`;
    str = node.children
        .reduce((pv, cv) => pv + reduceNodeToString(cv), str);
    return str + `</${node.type}>`;
}

function renderToString(node, dom, win) {
    node = node.inflate().flatten();
    node.props.add(new Prop(TERIO_ROOT, ''));
    return runInBrowserContext(reduceNodeToString, dom, win, node);
}

export {
    renderToString
};
