import {isString, isFunction, getType} from '../../utils/type';
import {toLowerCase} from '../../utils/string';
import {getNativeProp} from '../shared/props';
import {LOKI_ROOT} from '../../constants/attr';

function create(node, existingDOMNode, isHydrated = false, isRoot = false) {
    if(isString(node)) {
        if(!isHydrated) {
            return document.createTextNode(node);
        }
        if(getType(existingDOMNode) !== 'Text' || node !== existingDOMNode.textContent) {
            throw 'Hydration went wrong or parent is not empty!';
        }
        return existingDOMNode;
    }
    if(isFunction(node.type)) {
        const component = new node.type(node.props, node.children);
        return create(component.render(), existingDOMNode, isHydrated, isRoot);
    }
    if(isHydrated && (!existingDOMNode || node.type !== toLowerCase(existingDOMNode.tagName))) {
        throw 'Hydration went wrong or parent is not empty!';
    }
    const nodeProps = Object.entries(node.props)
                        .map(([name, value]) => getNativeProp(name, value));
    if(isHydrated) {
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
    if(!isHydrated) {
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
        if(isRoot) {
            el.setAttribute(LOKI_ROOT, '');
        }
        node.children
            .filter(child => child)
            .map(child => create(child))
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
            return create(child, existingDOMNode.childNodes[idx], isHydrated);
        });
    return existingDOMNode;
}

export {
    create
};
