import {isString, isFunction, getType, toLowerCase} from '../../utils/type';
import {getNativeProp} from '../shared/props';

function create(node, existingDOMNode, hydrate) {
    if(isString(node)) {
        if(!hydrate) {
            return document.createTextNode(node);
        }
        if(getType(existingDOMNode) !== 'Text' || node !== existingDOMNode.textContent) {
            throw 'Hydration went wrong or parent is not empty!';
        }
        return existingDOMNode;
    }
    if(isFunction(node.type)) {
        const component = new node.type(node.props, node.children);
        return create(component.render(), existingDOMNode);
    }
    if(hydrate && (!existingDOMNode || node.type !== toLowerCase(existingDOMNode.tagName))) {
        throw 'Hydration went wrong or parent is not empty!';
    }
    const nodeProps = Object.entries(node.props)
                        .map(([name, value]) => getNativeProp(name, value));
    if(hydrate) {
        const existingProps = existingDOMNode.getAttributeNames().reduce((pv, attr) => {
            pv[attr] = existingDOMNode.getAttribute(attr);
            return pv;
        }, {});
        nodeProps.forEach((prop) => {
            if(prop.isEvent || !isString(prop.value)) {
                return;
            }
            if(!existingProps[prop.name]) {
                throw 'Hydration went wrong or parent is not empty!';
            }
        });
    }
    if(!hydrate) {
        const el = document.createElement(node.type);
        nodeProps.forEach((prop) => {
            if(!prop.isEvent) {
                if(isString(prop.value)) {
                    el.setAttribute(prop.name, prop.value);
                }
                return;
            }
            el.addEventListener(prop.name, prop.value);
        });
        node.children
            .filter(child => child)
            .map(create)
            .forEach(el.appendChild.bind(el));
        return el;
    }
    nodeProps.forEach((prop) => {
        if(!prop.isEvent) {
            return;
        }
        existingDOMNode.addEventListener(prop.name, prop.value);
    });
    node.children
        .filter(child => child)
        .forEach((child, idx) => {
            if(!existingDOMNode.childNodes[idx]) {
                throw 'Hydration went wrong or parent is not empty!';
            }
            return create(child, existingDOMNode.childNodes[idx], hydrate);
        });
    return existingDOMNode;
}

export {
    create
};
