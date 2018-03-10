import {runInBrowserContext} from './browser';
import {TERIO_ROOT} from '../../constants/attr';
import {create as createVirtualNode} from '../../vdom/node';
import {isString} from '../../utils/type';
import Prop from '../../vdom/prop';

function reduceNodeToString(node) {
    if(isString(node)) {
        return node;
    }
    let str = '';
    let attrs = node.props.toString();
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
    node = node.clone();
    node.props.add(new Prop(TERIO_ROOT, ''));
    node = node.inflate();
    return runInBrowserContext(reduceNodeToString, dom, win, node);
}

export {
    renderToString
};
