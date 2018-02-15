import {runInBrowserContext} from './browser';
import {isString, isFunction} from '../../utils/type';
import {getNativeProp} from '../client/props';
import {VOID_ELEMENTS} from './element';

function reduceNodeToString(node) {
    if(isString(node)) {
        return node;
    }
    if(isFunction(node.type)) {
        const component = new node.type(node.props, node.children);
        return reduceNodeToString(component.render());
    }
    let attrs = '', str = '';
    if(node.props) {
        attrs = Object.entries(node.props)
            .map(([name, value]) => {
                return getNativeProp(name, value);
            })
            .filter(prop => !prop.isEvent)
            .map(prop => `${prop.name}="${prop.value}"`)
            .join(' ');
    }
    if(VOID_ELEMENTS.has(node.type)) {
        return `<${node.type}${attrs ? ` ${attrs}` : ''}/>`;
    }
    str += `<${node.type}${attrs ? ` ${attrs}` : ''}>`;
    str = node.children
            .filter(child => child)
            .reduce((pv, cv) => {
                return pv + reduceNodeToString(cv);
            }, str);
    return str + `</${node.type}>`;
}

function renderToString(node, dom, win) {
    return runInBrowserContext(reduceNodeToString, dom, win, node);
}

export {
    renderToString
};
