import {isString, isFunction} from '../../utils/type';
import {getNativeProp} from '../shared/props';

function create(node) {
    if(isString(node)) {
        return document.createTextNode(node);
    }
    if(isFunction(node.type)) {
        const component = new node.type(node.props, node.children);
        return create(component.render());
    }
    const el = document.createElement(node.type);
    if(node.props) {
        for (const [name, value] of Object.entries(node.props)) {
            const prop = getNativeProp(name, value);
            if(!prop.isEvent) {
                if(isString(prop.value)) {
                    el.setAttribute(prop.name, prop.value);
                }
                continue;
            }
            el.addEventListener(prop.name, prop.value);
        }
    }
    node.children
        .filter(child => child)
        .map(create)
        .forEach(el.appendChild.bind(el));
    return el;
}

export {
    create
};
