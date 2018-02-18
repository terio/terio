import {runInBrowserContext} from './browser';
import {isString, isFunction} from '../../utils/type';
import {getNativeProp} from '../shared/props';
import {VOID_ELEMENTS} from './element';
import {LOKI_ROOT} from '../../constants/attr';

function reduceNodeToString(node, isRoot = false) {
    if(isString(node)) {
        return node;
    }
    if(isFunction(node.type)) {
        const component = new node.type(node.props, node.children);
        return reduceNodeToString(component.render(), isRoot);
    }
    let str = '';
    let attrs = Object.entries(node.props)
        .map(([name, value]) => {
            return getNativeProp(name, value);
        })
        .filter(prop => !prop.isEvent && isString(prop.value))
        .map(prop => `${prop.name}="${prop.value}"`)
        .join(' ');
    if(isRoot) {
        attrs = [attrs, LOKI_ROOT].join(' ');
        isRoot = false;
    }
    if(VOID_ELEMENTS.has(node.type)) {
        return `<${node.type}${attrs ? ` ${attrs}` : ''}/>`;
    }
    str += `<${node.type}${attrs ? ` ${attrs}` : ''}>`;
    str = node.children
            .filter(child => child)
            .reduce((pv, cv) => {
                return pv + reduceNodeToString(cv, false);
            }, str);
    return str + `</${node.type}>`;
}

function renderToString(node, dom, win) {
    return runInBrowserContext(reduceNodeToString, dom, win, node, true);
}

export {
    renderToString
};
