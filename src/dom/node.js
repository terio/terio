import {isString, isFunction} from '../utils/type';

function create(node) {
    if(isString(node)) {
        return document.createTextNode(node);
    }
    if(isFunction(node.type)) {
        const component = new node.type(node.props, node.children);
        return create(component.render());
    }
    const el = document.createElement(node.type);
    node.children
        .filter(child => child)
        .map(create)
        .forEach(el.appendChild.bind(el));
    return el;
}

export {
    create
};
